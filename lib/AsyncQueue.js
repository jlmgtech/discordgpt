class AsyncQueue {

    constructor() {
        this.queue = [];
        this.ready = Promise.resolve();
        this.resolvers = [];
    }

    push(element) {
        const queuelen = this.queue.length;
        this.queue.push(element);
        if (queuelen === 0) {
            while (this.resolvers.length) {
                this.resolvers.shift()();
            }
        }
    }

    async next() {
        while (!this.queue.length) {
            await new Promise(resolve => {
                this.resolvers.push(resolve);
            });
        }
        return this.queue.shift();
    }
}


function test() {
    // test a single listener to the async queue
    const queue = new AsyncQueue();
    queue.push(1);
    queue.push(2);
    let i = 2;
    function addRandom() {
        setTimeout(() => {
            queue.push(++i);
            addRandom();
        }, Math.random() * 1000);
    }
    addRandom();

    (async () => {
        let value;
        while (value = await queue.next()) {
            console.log("A:", value);
        }
    })();

    (async () => {
        let value;
        while (value = await queue.next()) {
            console.log("B:", value);
        }
    })();


    setTimeout(() => {}, 10000);
    // test multiple listeners to the async queue
}

module.exports = AsyncQueue;
