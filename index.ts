enum TransactionType { Auth, Capture };

class Transaction {
    constructor(id, date: string, amount) {
        this.date = new Date(date).getTime();
        this.amount = amount;
        this.id = id;
    }
    date: number;
    amount: number;
    id: number;
}

class AuthTransaction extends Transaction {
    expiration: number;
    type: TransactionType;
    constructor(id, date, amount, expiration) {
        super(id, date, amount);
        this.expiration = this.date + expiration * 60 * 60 * 1000;
        this.type = TransactionType.Auth;
    }
}

class CaptureTransaction extends Transaction {
    connectedTransactionId: number;
    type: TransactionType;
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

    balance: number;
    transactionsHeap: MinHeap;

    handleTransaction(transaction: AuthTransaction | CaptureTransaction) {
        console.log('-------');
        const curTime = Date.now();
        this.updatePQ(curTime);
        if (transaction.type === TransactionType.Auth) {
            console.log('Auth transaction added', JSON.stringify(transaction));
            if (this.balance >= transaction.amount) {
                this.balance = this.balance - transaction.amount;
                this.transactionsHeap.insert(transaction as AuthTransaction);
            }
        } else {
            console.log('Capture transaction added', JSON.stringify(transaction));
            const authTransaction = this.transactionsHeap.getById((transaction as CaptureTransaction).connectedTransactionId);
            if (authTransaction) {
                authTransaction.amount = authTransaction.amount - transaction.amount;
                if (authTransaction.amount === 0) {
                    this.transactionsHeap.removeItem(authTransaction);
                }
            }
        }
        this.log();
    }

    updatePQ(curTime: number) {
        
        while (this.transactionsHeap.getTop()?.expiration <= curTime) {
            const trBalance = this.transactionsHeap.getTop();
            this.balance = this.balance + trBalance.amount;
            this.transactionsHeap.removeTop();
        }
    }

    log() {
        console.log('Balance', this.balance);
        console.log('Heap:', this.transactionsHeap.data.map(d => JSON.stringify(d)));
    }
}

class MinHeap {
    constructor(comparatorField: string) {
        this.comparatorField = comparatorField;
    }
    data: AuthTransaction[] = [];
    comparatorField: string;

    // O(logN)
    insert(transaction: AuthTransaction) {
        this.data.push(transaction);
        this.#bubbleUp(this.data.length - 1);
    }

    // O(logN)
    removeTop() {
        if (this.data.length === 0) return undefined;
        let min = this.data[0];
        this.data[0] = this.data.pop() as AuthTransaction;
        this.#bubbleDown(0);
        return min;
    }

    // O(logN)
    removeItem(item: AuthTransaction) {
        const indexToRemove = this.data.indexOf(item);
        if (indexToRemove !== this.data.length - 1) {
            this.data[indexToRemove] = this.data.pop() as AuthTransaction;
            this.#bubbleDown(indexToRemove);
        } else {
            this.data.pop();
        }
    }

    // O(1)
    getTop(): AuthTransaction {
        return this.data[0];
    }

    // O(n)
    getById(id: number): AuthTransaction | undefined {
        return this.data.find(i => i.id === id);
    }

    #bubbleUp = (index) => {
        while (index > 0) {
            // get the parent
            var parent = Math.floor((index + 1) / 2) - 1;

            // if parent is greater than child
            if (this.data[parent][this.comparatorField as keyof AuthTransaction] > this.data[index][this.comparatorField as keyof AuthTransaction]) {
                // swap
                var temp = this.data[parent];
                this.data[parent] = this.data[index];
                this.data[index] = temp;
            }

            index = parent;
        }
    };
    
    #bubbleDown = (index) => {
        while (true) {
          let child = (index+1)*2;
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
      };
}


const stream = new TransactionStream();
stream.handleTransaction(new AuthTransaction(1, "2023-03-11 00:00", 1000, 150));
stream.handleTransaction(new AuthTransaction(2, "2023-03-12 00:00", 10, 24));
stream.handleTransaction(new AuthTransaction(3, "2023-03-13 00:00", 100, 24));
stream.handleTransaction(new CaptureTransaction(4, "2023-03-14 00:00", 100, 1));
stream.handleTransaction(new CaptureTransaction(5, "2023-03-15 00:00", 10, 2));
stream.handleTransaction(new CaptureTransaction(6, "2023-03-16 00:00", 900, 1));
stream.handleTransaction(new CaptureTransaction(7, "2023-03-17 00:00", 100, 3));
