var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MinHeap_bubbleUp, _MinHeap_bubbleDown;
var TransactionType;
(function (TransactionType) {
    TransactionType[TransactionType["Auth"] = 0] = "Auth";
    TransactionType[TransactionType["Capture"] = 1] = "Capture";
})(TransactionType || (TransactionType = {}));
;
class Transaction {
    constructor(id, date, amount) {
        this.date = new Date(date).getTime();
        this.amount = amount;
        this.id = id;
    }
}
class AuthTransaction extends Transaction {
    constructor(id, date, amount, expiration) {
        super(id, date, amount);
        this.expiration = this.date + expiration * 60 * 60 * 1000;
        this.type = TransactionType.Auth;
    }
}
class CaptureTransaction extends Transaction {
    constructor(id, date, amount, connectedTrID) {
        super(id, date, amount);
        this.connectedTransactionId = connectedTrID;
        this.type = TransactionType.Capture;
    }
}
class TransactionStream {
    constructor() {
        this.balance = 2000;
        this.transactionsHeap = new MinHeap('expiration');
    }
    handleTransaction(transaction) {
        const curTime = Date.now();
        this.updatePQ(curTime);
        if (transaction.type === TransactionType.Auth) {
            if (this.balance >= transaction.amount) {
                this.balance = this.balance - transaction.amount;
                this.transactionsHeap.insert(transaction);
            }
        }
        else {
            const authTransaction = this.transactionsHeap.getById(transaction.connectedTransactionId);
            if (authTransaction) {
                authTransaction.amount = authTransaction.amount - transaction.amount;
                if (authTransaction.amount === 0) {
                    this.transactionsHeap.removeItem(authTransaction);
                }
            }
        }
        this.log();
    }
    updatePQ(curTime) {
        var _a;
        while (((_a = this.transactionsHeap.getTop()) === null || _a === void 0 ? void 0 : _a.expiration) <= curTime) {
            const trBalance = this.transactionsHeap.getTop();
            this.balance = this.balance + trBalance.amount;
            this.transactionsHeap.removeTop();
        }
    }
    log() {
        console.log(this.balance, this.transactionsHeap.data.map(d => JSON.stringify(d)));
    }
}
class MinHeap {
    constructor(comparatorField) {
        this.data = [];
        _MinHeap_bubbleUp.set(this, (index) => {
            while (index > 0) {
                // get the parent
                var parent = Math.floor((index + 1) / 2) - 1;
                // if parent is greater than child
                if (this.data[parent][this.comparatorField] > this.data[index][this.comparatorField]) {
                    // swap
                    var temp = this.data[parent];
                    this.data[parent] = this.data[index];
                    this.data[index] = temp;
                }
                index = parent;
            }
        });
        _MinHeap_bubbleDown.set(this, (index) => {
            while (true) {
                let child = (index + 1) * 2;
                let sibling = child - 1;
                let toSwap;
                // if current is greater than child
                if (this.data[index] > this.data[child]) {
                    toSwap = child;
                }
                // if sibling is smaller than child, but also smaller than current
                if (this.data[index] > this.data[sibling] && (this.data[child] == null || (this.data[child] !== null && this.data[sibling] < this.data[child]))) {
                    toSwap = sibling;
                }
                // if we don't need to swap, then break.
                if (toSwap == null) {
                    break;
                }
                var temp = this.data[toSwap];
                this.data[toSwap] = this.data[index];
                this.data[index] = temp;
                index = toSwap;
            }
        });
        this.comparatorField = comparatorField;
    }
    // O(logN)
    insert(transaction) {
        this.data.push(transaction);
        __classPrivateFieldGet(this, _MinHeap_bubbleUp, "f").call(this, this.data.length - 1);
    }
    // O(logN)
    removeTop() {
        if (this.data.length === 0)
            return undefined;
        let min = this.data[0];
        this.data[0] = this.data.pop();
        __classPrivateFieldGet(this, _MinHeap_bubbleDown, "f").call(this, 0);
        return min;
    }
    // O(logN)
    removeItem(item) {
        const indexToRemove = this.data.indexOf(item);
        if (indexToRemove !== this.data.length - 1) {
            this.data[indexToRemove] = this.data.pop();
            __classPrivateFieldGet(this, _MinHeap_bubbleDown, "f").call(this, indexToRemove);
        }
        else {
            this.data.pop();
        }
    }
    // O(1)
    getTop() {
        return this.data[0];
    }
    // O(n)
    getById(id) {
        return this.data.find(i => i.id === id);
    }
}
_MinHeap_bubbleUp = new WeakMap(), _MinHeap_bubbleDown = new WeakMap();
const stream = new TransactionStream();
stream.handleTransaction(new AuthTransaction(1, "2023-03-11 00:00", 1000, 150));
stream.handleTransaction(new AuthTransaction(2, "2023-03-12 00:00", 10, 24));
stream.handleTransaction(new AuthTransaction(3, "2023-03-13 00:00", 100, 24));
stream.handleTransaction(new CaptureTransaction(4, "2023-03-14 00:00", 100, 1));
stream.handleTransaction(new CaptureTransaction(5, "2023-03-15 00:00", 10, 2));
stream.handleTransaction(new CaptureTransaction(6, "2023-03-16 00:00", 900, 1));
stream.handleTransaction(new CaptureTransaction(7, "2023-03-17 00:00", 100, 3));
//# sourceMappingURL=index.js.map