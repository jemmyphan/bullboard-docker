const {
  ExpressAdapter,
  createBullBoard,
  BullMQAdapter,
} = require("@bull-board/express");
const { Queue: QueueMQ, Worker, QueueScheduler } = require("bullmq");
const Redis = require("ioredis");
const express = require("express");

const host = process.env.REDIS_HOST || "localhost";
const port = process.env.REDIS_HOST || 6379;
const password = process.env.REDIS_PASSWORD || "";
const bullPrefix = process.env.BULL_PREFIX || "bull";

const redisOptions = {
  port,
  host,
  password,
  tls: false,
};

const redis = new Redis({
  host,
  port,
  password,
});

const serverAdapter = new ExpressAdapter();

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [],
  serverAdapter: serverAdapter,
});

const app = express();

const handler = serverAdapter.getRouter();

app.use("/", async (...args) => {
  const keys = await redis.keys(`${bullPrefix}:*:id`);
  const queues = keys.reduce((prev, current) => {
    const regExp = new RegExp(`${bullPrefix}:(.*):id`);
    const queueName = current.replace(regExp, "$1");
    if (queueName === "BullMQ") {
      return prev;
    }
    return prev.concat(
      new BullMQAdapter(new QueueMQ(queueName, { connection: redis }))
    );
  }, []);
  setQueues(queues);
  return handler(...args);
});

app.listen(8787, () => {
  console.log("Running on 8787...");
});
