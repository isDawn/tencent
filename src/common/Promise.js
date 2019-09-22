export default class Oath {
    constructor(backResRejFun) {
        this.status = 'pending'; // Promise状态
        this.fulfilledcb = null; // resolve回调callBack
        this.rejectedcb = null; // reject回调callBack
        this.nextResolve = null; // 新promise返回的resolve
        this.nextReject = null; // 新promise返回的reject
        backResRejFun && backResRejFun(this.resolve.bind(this), this.reject.bind(this));
    }


    resolve(result) {
        setTimeout(() => {
            if (this.status === 'pending') {
                // 把当前状态从pending修改为fulfilled
                this.status = 'fulfilled';
                this.nextResolve && this.nextResolve(this.fulfilledcb && this.fulfilledcb(result));
            }
        }, 0)

    }

    reject(reason) {
        setTimeout(() => {
            if (this.status === 'pending') {
                // 把当前状态从pending修改为rejected
                this.status = 'rejected'
                if (this.rejectedcb) {
                    this.nextResolve && this.nextResolve(this.rejectedcb && this.rejectedcb(reason));
                } else {
                    this.nextReject && this.nextReject(reason);
                }
            }
        }, 0)
    }

    then(callback_res, callback_rej) {
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
}