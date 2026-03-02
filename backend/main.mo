import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

actor {
  let predictionRecords = Map.empty<Nat, PredictionRecord>();
  var nextId = 0;

  type WeatherSnapshot = {
    temperature : Float;
    humidity : Float;
    precipitation : Float;
    weatherDescription : Text;
  };

  type PredictionRecord = {
    id : Nat;
    farmerSessionId : Nat;
    cropType : Text;
    diseaseName : Text;
    confidenceScore : Float;
    timestamp : Time.Time;
    weatherSnapshot : WeatherSnapshot;
  };

  type AddPredictionRecordRequest = {
    farmerSessionId : Nat;
    cropType : Text;
    diseaseName : Text;
    confidenceScore : Float;
    weatherSnapshot : WeatherSnapshot;
  };

  public shared ({ caller }) func addPredictionRecord(request : AddPredictionRecordRequest) : async Nat {
    let record : PredictionRecord = {
      id = nextId;
      farmerSessionId = request.farmerSessionId;
      cropType = request.cropType;
      diseaseName = request.diseaseName;
      confidenceScore = request.confidenceScore;
      timestamp = Time.now();
      weatherSnapshot = request.weatherSnapshot;
    };
    predictionRecords.add(nextId, record);
    nextId += 1;
    record.id;
  };

  public query ({ caller }) func getPredictionRecordById(id : Nat) : async PredictionRecord {
    switch (predictionRecords.get(id)) {
      case (null) { Runtime.trap("Record not found") };
      case (?record) { record };
    };
  };

  public query ({ caller }) func getRecordsBySessionId(sessionId : Nat) : async [PredictionRecord] {
    let results = List.empty<PredictionRecord>();
    for ((_, record) in predictionRecords.entries()) {
      if (record.farmerSessionId == sessionId) {
        results.add(record);
      };
    };
    results.toArray();
  };
};
