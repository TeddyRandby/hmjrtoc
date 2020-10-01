const projectId = "hmjri-280502";
const location = "us-central1";
const modelId = "IOD8192261027442720768";
const inputUri = "gs://hmjri-280502-vcm/batch.csv";
const outputUri = "gs://hmjri-280502-vcm/prediction-results/";

// Imports the Google Cloud AutoML library
const { PredictionServiceClient } = require("@google-cloud/automl").v1;

// Instantiates a client
const client = new PredictionServiceClient();

async function batchPredict() {
  // Construct request
  const request = {
    name: client.modelPath(projectId, location, modelId),
    inputConfig: {
      gcsSource: {
        inputUris: [inputUri],
      },
    },
    outputConfig: {
      gcsDestination: {
        outputUriPrefix: outputUri,
      },
    },
  };

  const [operation] = await client.batchPredict(request);

  console.log(operation);
  console.log("Waiting for operation to complete...");
  // Wait for operation to complete.
  const [response] = await operation.promise();
  console.log(
    `Batch Prediction results saved to Cloud Storage bucket. ${response}`
  );
}

batchPredict();
