
 class Promisest {
    constructor(backPromisestFun, getPromiseData) {
        this.PromiseStatus = Promisest.data(getPromiseData).status;
        this.PromiseValue = Promisest.data(getPromiseData).result;
        backPromisestFun && backPromisestFun(this.resolve.bind(this), this.reject.bind(this))
        this.rejectBack = null;
        this.resolveBack = null;
        this.nextResolve = null;
        this.nextReject = null;
    }

    resolve(result) {
        if (this.PromiseStatus === 'pending') {
            this.PromiseStatus = 'resolved';
            this.PromiseValue = result;
            if (!this.nextResolve) {
                return new Promisest(() => {}, { status: this.PromiseStatus, result: this.PromiseValue });
            }
            if (this.resolveBack) {
                this.nextResolve(this.resolveBack && this.resolveBack(this.PromiseValue));
            } else {
                this.nextResolve(this.PromiseValue);
            }
        }
    }

    reject(reason) {
        if (this.PromiseStatus === 'pending') {
            this.PromiseStatus = 'rejected';
            this.PromiseValue = reason;
            if (!this.nextReject) {
                return new Promisest(() => {}, { status: this.PromiseStatus, result: this.PromiseValue });
            }
            if (this.rejectBack) {
                this.nextResolve(this.rejectBack(this.PromiseValue));
            } else {
                this.nextReject(this.PromiseValue);
            }
        }
    }

    then(resBack, rejBack) {
        if (this.PromiseStatus === 'resolved') {
            this.PromiseValue = resBack && resBack(this.PromiseValue);
        } else if (this.PromiseStatus === 'rejected') {
            if (rejBack) {
                this.PromiseValue = rejBack && rejBack(this.PromiseValue);
                this.PromiseStatus = 'resolved';
            } 
        } else {
            this.resolveBack = resBack ? resBack : null;
            this.rejectBack = rejBack ? rejBack : null;
            return new Promisest((res,rej) => { this.nextResolve = res; this.nextReject = rej }, { status: this.PromiseStatus, result: this.result });
        }    
        return new Promisest(() => {  }, { status: this.PromiseStatus, result: this.PromiseValue });
    }

    catch(catchBack) {
        if (this.PromiseStatus === 'rejected') {
            if (catchBack) {
                this.PromiseValue = catchBack(this.PromiseValue);
                this.PromiseStatus = 'resolved';
                return new Promisest(() => {}, { status: this.PromiseStatus, result: this.PromiseValue });
            }
        } else {
            this.rejectBack = catchBack ? catchBack : null;
            return new Promisest((res,rej) => { this.nextResolve = res; this.nextReject = rej }, { status: this.PromiseStatus, result: this.result });
        }
    }

    static data(d) {
        if (d && d.status) {
            return { status: d.status, result: d.result, }
        } else {
            return { status: 'pending', result: null };
        }
    }

    static all(allPromise) {
        const len = allPromise.length;
        const index = 0;
        const arr = [];
        return new Promisest((res,rej)=>{
            this.allPromise(allPromise,index,len,arr,res,rej);
        })
        
    }

    static allPromise(allPromise, index, len, arr, resolve, reject) {
        if (index < len) {
            allPromise[index].then((res) => {
                if (this.isP(res)) {
                    res.then(res=>{
                        arr.push(res);
                        if (index === len - 1) {
                            resolve(arr)
                        } else {
                            this.allPromise(allPromise, ++index, len, arr, resolve, reject);
                        }
                    }).catch(err=>{
                        reject(err)
                    })
                } else {
                    arr.push(res);
                    if (index === len - 1) {
                        resolve(arr)
                    } else {
                        this.allPromise(allPromise, ++index, len, arr, resolve, reject);
                    }
                }
            }).catch((rej) => {
                if (this.isP(rej)) {
                    rej.then(res=>{
                        reject(res);
                    }).catch(err=>{
                        reject(err);
                    })
                } else {
                    reject(rej);
                }
            })
        }
    }

    static isP(res) {
        return res.constructor === Promisest
    }

}


 export {
    Promisest,
 };