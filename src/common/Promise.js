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
                this.status = 'rejected'
                let errStatus = false;
                this.callbackArr && this.callbackArr.forEach((item) => {
                    if (item.rejectBack && !errStatus && this.isFun(item.rejectBack)) {
                        result = item.rejectBack(result)
                        errStatus = true;
                    } else if (item.catchBack && this.isFun(item.catchBack) && !errStatus) {
                        result = item.catchBack(result);
                        errStatus = true;
                    } else if (errStatus) {
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
        this.callbackArr.push({
            resolveBack: callback_res,
            rejectBack: callback_rej
        });
        return { then: this.then.bind(this), catch: this.catch.bind(this) };
    }

    catch(callback) {
        if (!callback || !this.isFun(callback)) {
            throw new Error('this is not a function');
        }
        this.callbackArr.push({
            catchBack: callback
        })
        return { then: this.then.bind(this), catch: this.catch.bind(this) };
    }

    isFun(fun) {
        return typeof fun === 'function';
    }
}