export default class Oath {
    constructor(backResRejFun) {
        this.status = 'pending';
        this.callbackArr = [];
        backResRejFun && backResRejFun(this.resolve.bind(this), this.reject.bind(this));
    }


    resolve(val) {
        setTimeout(() => {
            if (this.status === 'pending') {
                // 把当前状态从pending修改为fulfilled
                console.log("走的res")
                this.status = 'fulfilled';
                let result = val;
                this.callbackArr && this.callbackArr.forEach((item) => {
                    result = item.resolveBack && item.resolveBack(result);
                })
            }
        }, 0)

    }

    reject(val) {
        setTimeout(() => {
            let result = val;
            if (this.status === 'pending') {
                // 把当前状态从pending修改为rejected
                console.log("走的rej")
                this.status = 'rejected'
                let errStatus = false;
                this.callbackArr && this.callbackArr.forEach((item) => {
                    if (item.rejectBack && !errStatus && this.isFun(item.rejectBack)) {
                        console.log(1)
                        result = item.rejectBack(result)
                        errStatus = true;
                    } else if (item.catchBack && this.isFun(item.catchBack) && !errStatus) {
                        console.log(2)
                        result = item.catchBack(result);
                        errStatus = true;
                    } else if (errStatus) {
                        console.log(3)
                        if (item.resolveBack && this.isFun(item.resolveBack)) {
                            result = item.resolveBack(result);
                        }
                    }
                })
            }
        }, 0)
    }

    then(callback_res, callback_rej) {
        if (!callback_res || !this.isFun(callback_res)) {
            throw new Error('this is not a function');
        }
        this.addPromiseCallBack({
            resolveBack: callback_res,
            rejectBack: callback_rej
        });
        return new Oath((res,rej)=>{
            this.addPromiseCallBack({
                resolveBack: res,
                rejectBack: rej
            })
        });
    }

    catch(callback) {
        if (!callback || !this.isFun(callback)) {
            throw new Error('this is not a function');
        }
        this.addPromiseCallBack({catchBack: callback});
        return new Oath((res,rej)=>{
            this.addPromiseCallBack({
                resolveBack: res,
                rejectBack: rej
            })
        });
    }

    isFun(fun) {
        return typeof fun === 'function';
    }

    addPromiseCallBack(obj = {}) {
        if (typeof obj === 'object' && obj !== null) {
            this.callbackArr.push(obj);
        }
    }
}