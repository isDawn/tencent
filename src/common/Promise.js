export default class Oath {
    constructor(backResRejFun) {
        this.status = 'pending'; // Promise状态
        this.fulfilledcb = null; // resolve回调callBack
        this.rejectedcb = null; // reject回调callBack
        this.nextResolve = null; // 新promise返回的resolve
        this.nextReject = null; // 新promise返回的reject
        this.await = false;
        backResRejFun && backResRejFun(this.resolve.bind(this), this.reject.bind(this));
    }


    resolve(result) {
        console.log('------')
        if ( (!this.fulfilledcb || !this.nextResolve ) && !this.await) {
            this.await = true;
            this.await = ++this.await;
            setTimeout(this.resolve.bind(this, result), 0);
            return;
        }
        if (this.status === 'pending') {
            // 把当前状态从pending修改为fulfilled
            this.status = 'fulfilled';
            this.nextResolve && this.nextResolve(this.fulfilledcb && this.fulfilledcb(result));
        }
    }

    reject(reason) {
        if (!this.rejectedcb && !this.nextReject && !this.await) {
            this.await = true;
            setTimeout(this.reject.bind(this, reason), 0);
            return;
        }
        if (this.status === 'pending') {
            // 把当前状态从pending修改为rejected
            this.status = 'rejected'
            if (this.rejectedcb) {
                this.nextResolve && this.nextResolve(this.rejectedcb && this.rejectedcb(reason));
            } else {
                this.nextReject && this.nextReject(reason);
            }
        }
    }

    then(type,callback_res, callback_rej) {
        console.log('then',type)
        if (!callback_res || !this.isFun(callback_res)) {
            throw new Error('this is not a function');
        }
        this.fulfilledcb = callback_res ? callback_res : null;
        this.rejectedcb = callback_rej ? callback_rej : null;
        return this.newPromise();
    }

    catch(callback) {
        if (!callback || !this.isFun(callback)) {
            throw new Error('this is not a function');
        }
        this.rejectedcb = callback;
        return this.newPromise();
    }

    isFun(fun) {
        return typeof fun === 'function';
    }

    newPromise() {
        return new Oath((res, rej) => {
            this.nextResolve = res ? res : null;
            this.nextReject = rej ? rej : null;
        });
    }

    static all(allPromise) {
        console.log(allPromise)
        const len = allPromise.length;
        const index = 0;
        const arr = [];
        // return new Oath((res,rej)=>{
        //     this.allPromise(allPromise,index,len,arr,res,rej);
        // })
    }

    static allPromise(allPromise,index,len,arr,resolve,reject) {
        if (index <= len) {
            allPromise[index].then('for',(res)=>{
                arr.push(JSON.stringify(res));
                if (index === len - 1) {
                    resolve(arr)
                } else {
                    this.allPromise(allPromise,++index,len,arr,resolve,reject);
                }
            }).catch((rej)=>{
                reject(JSON.stringify(rej));
            })
        }
    }
}