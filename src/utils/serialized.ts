// Runs tasks with the same key one at a time, in call order. A failed task doesn't block the next one.
// ponytail: in-memory queue, fine while the bot runs as a single process
const queues = new Map<string, Promise<unknown>>();

export const serialized = <T>(key: string, task: () => Promise<T>): Promise<T> => {
    const run = (queues.get(key) ?? Promise.resolve()).then(task, task);
    const tail = run.catch(() => null);
    queues.set(key, tail);
    tail.then(() => {
        if (queues.get(key) === tail) queues.delete(key);
    });
    return run;
};

export const pendingQueues = () => queues.size;
