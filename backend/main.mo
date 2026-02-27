import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type PlayerProfile = {
    username : Text;
    unlockedLevels : [Nat];
    bestScoresPerLevel : [(Nat, Nat)];
  };

  type CommunityLevel = {
    id : Nat;
    creator : Principal;
    title : Text;
    tileData : Text;
    playCount : Nat;
    ratings : [Nat];
    averageRating : Float;
  };

  type LeaderboardEntry = {
    player : Principal;
    score : Nat;
    timestamp : Time.Time;
  };

  let playerProfiles = Map.empty<Principal, PlayerProfile>();
  let communityLevels = Map.empty<Nat, CommunityLevel>();
  let leaderboards = Map.empty<Nat, [LeaderboardEntry]>();
  var nextLevelId = 1;

  // ── Profile endpoints ─────────────────────────────────────────────────────———
  /// Only authenticated users can read their own profile.
  public query ({ caller }) func getCallerUserProfile() : async ?PlayerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    playerProfiles.get(caller);
  };

  /// Only authenticated users can save their own profile.
  public shared ({ caller }) func saveCallerUserProfile(profile : PlayerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    playerProfiles.add(caller, profile);
  };

  /// Public: anyone can look up a player profile (needed for leaderboard display).
  public query func getUserProfile(user : Principal) : async ?PlayerProfile {
    playerProfiles.get(user);
  };

  // ── Community level endpoints ─────────────────────────────────────────────———
  /// Only authenticated users can publish levels.
  public shared ({ caller }) func publishLevel(title : Text, tileData : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can publish levels");
    };
    let levelId = nextLevelId;
    nextLevelId += 1;

    let newLevel : CommunityLevel = {
      id = levelId;
      creator = caller;
      title;
      tileData;
      playCount = 0;
      ratings = [];
      averageRating = 0.0;
    };

    communityLevels.add(levelId, newLevel);
    levelId;
  };

  /// Public: anyone (including guests) can browse community levels.
  public query func getAllCommunityLevels() : async [CommunityLevel] {
    communityLevels.values().toArray();
  };

  /// Public: anyone can fetch a single community level.
  public query func getCommunityLevel(id : Nat) : async ?CommunityLevel {
    communityLevels.get(id);
  };

  /// Only the creator (authenticated user) can delete their own level.
  public shared ({ caller }) func deleteLevel(levelId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can delete levels");
    };

    switch (communityLevels.get(levelId)) {
      case (null) { Runtime.trap("Level not found") };
      case (?level) {
        if (level.creator != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or an admin can delete this level");
        };
        communityLevels.remove(levelId);
      };
    };
  };

  /// Only authenticated users can rate a level (guests cannot submit ratings).
  public shared ({ caller }) func rateLevel(levelId : Nat, rating : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can rate levels");
    };
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    switch (communityLevels.get(levelId)) {
      case (null) { Runtime.trap("Level not found") };
      case (?level) {
        let newRatings = level.ratings.concat([rating]);
        var total : Nat = 0;
        for (r in newRatings.vals()) {
          total += r;
        };
        let newAverage : Float = total.toFloat() / newRatings.size().toFloat();

        let updatedLevel : CommunityLevel = {
          id = level.id;
          creator = level.creator;
          title = level.title;
          tileData = level.tileData;
          playCount = level.playCount;
          ratings = newRatings;
          averageRating = newAverage;
        };
        communityLevels.add(levelId, updatedLevel);
      };
    };
  };

  /// Only authenticated users can increment play count (guests cannot save progress).
  public shared ({ caller }) func incrementPlayCount(levelId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can record play counts");
    };
    switch (communityLevels.get(levelId)) {
      case (null) {};
      case (?level) {
        let updatedLevel : CommunityLevel = {
          id = level.id;
          creator = level.creator;
          title = level.title;
          tileData = level.tileData;
          playCount = level.playCount + 1;
          ratings = level.ratings;
          averageRating = level.averageRating;
        };
        communityLevels.add(levelId, updatedLevel);
      };
    };
  };

  // ── Leaderboard endpoints ─────────────────────────────────────────────────———
  /// Only authenticated users can submit a score to the leaderboard.
  public shared ({ caller }) func submitScore(levelId : Nat, score : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can appear on the leaderboard");
    };

    let entry : LeaderboardEntry = {
      player = caller;
      score;
      timestamp = Time.now();
    };

    let existing : [LeaderboardEntry] = switch (leaderboards.get(levelId)) {
      case (null) { [] };
      case (?entries) { entries };
    };

    // Replace existing entry for this player if the new score is higher,
    // otherwise keep the old one; add new entry if player not yet present.
    var found = false;
    var updated : [LeaderboardEntry] = existing.map<LeaderboardEntry, LeaderboardEntry>(
      func(e) {
        if (e.player == caller) {
          found := true;
          if (score > e.score) { entry } else { e };
        } else {
          e;
        };
      },
    );

    if (not found) {
      updated := updated.concat([entry]);
    };

    // Sort descending by score and keep top 10.
    let sorted = updated.sort(
      func(a, b) { Nat.compare(b.score, a.score) },
    );
    let top10 = if (sorted.size() > 10) {
      sorted.sliceToArray(0, 10);
    } else {
      sorted;
    };

    leaderboards.add(levelId, top10);
  };

  /// Public: anyone can view the leaderboard for a level.
  public query func getLeaderboardEntries(levelId : Nat) : async [LeaderboardEntry] {
    switch (leaderboards.get(levelId)) {
      case (null) { [] };
      case (?entries) { entries };
    };
  };

  /// Public: anyone can view all levels (alias kept for frontend compatibility).
  public query func getAllLevels() : async [CommunityLevel] {
    communityLevels.values().toArray();
  };

  /// Public: anyone can view top-rated levels.
  public query func getTopRatedLevels(limit : Nat) : async [CommunityLevel] {
    let all = communityLevels.values().toArray();
    let sorted = all.sort(
      func(a, b) { Float.compare(b.averageRating, a.averageRating) },
    );
    if (sorted.size() > limit) {
      sorted.sliceToArray(0, limit);
    } else {
      sorted;
    };
  };
};
