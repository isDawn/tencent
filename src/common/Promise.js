export default class Oath {
    constructor(backResRejFun, insidePromiseData) {
        this.status = 'pending'; // Promise状态
        this.fulfilledcb = null; // resolve回调callBack
        this.rejectedcb = null; // reject回调callBack
        this.nextResolve = null; // 新promise返回的resolve
        this.nextReject = null; // 新promise返回的reject
        this.await = false;
        backResRejFun && backResRejFun(this.resolve.bind(this), this.reject.bind(this));
        if (insidePromiseData && insidePromiseData.status) {
            this.status = insidePromiseData.status;
            if (this.status === 'fulfilled') {
                this.result = insidePromiseData.result;
            } else if (this.status === 'rejected') {
                this.reason = insidePromiseData.result;
            }
        }
    }


    resolve(result) {
        console.log('------')
        if (this.status === 'pending') {
            // 把当前状态从pending修改为fulfilled
            this.status = 'fulfilled';
            // this.nextResolve && this.nextResolve(this.fulfilledcb && this.fulfilledcb(result));
            const s = this.fulfilledcb && this.fulfilledcb(result);
            return new Oath((res, rej) => {

            }, { status: this.status, s: s })
        }
    }

    reject(reason) {
        if (this.status === 'pending') {
            // 把当前状态从pending修改为rejected
            this.status = 'rejected'
            // if (this.rejectedcb) {
            // this.nextResolve && this.nextResolve(this.rejectedcb && this.rejectedcb(reason));
            // } else {
            //     this.nextReject && this.nextReject(reason);
            // }
            const j = this.rejectedcb && this.rejectedcb(reason);
            return new Oath((res, rej) => {

            }, { status: this.status, s: j })
        }
    }

    then(callback_res, callback_rej) {
        if (!callback_res || !this.isFun(callback_res)) {
            throw new Error('this is not a function');
        }
        this.fulfilledcb = callback_res ? callback_res : null;
        this.rejectedcb = callback_rej ? callback_rej : null;
        if (this.status === 'fulfilled') {
            this.fulfilledcb(this.result)
        }
        return this.newPromise();
    }

    catch(callback) {
        if (!callback || !this.isFun(callback)) {
            throw new Error('this is not a function');
        }
        this.rejectedcb = callback;
        return this.newPromise(this.reason);
    }

    isFun(fun) {
        return typeof fun === 'function';
    }

    newPromise() {
        return new Oath((res,rej)=>{},{status: this.status, s: this.status === 'fulfilled' ? this.result : this.reason})
    }

    static all(allPromise) {
        console.log(allPromise)
        const len = allPromise.length;
        const index = 0;
        const arr = [];
        return new Oath((res,rej)=>{
            this.allPromise(allPromise,index,len,arr,res,rej);
        })
        
    }

    static allPromise(allPromise, index, len, arr, resolve, reject) {
        if (index <= len) {
            allPromise[index].then((res) => {
                arr.push(JSON.stringify(res));
                if (index === len - 1) {
                    resolve(arr)
                } else {
                    this.allPromise(allPromise, ++index, len, arr, resolve, reject);
                }
            }).catch((rej) => {
                reject(JSON.stringify(rej));
            })
        }
    }
}