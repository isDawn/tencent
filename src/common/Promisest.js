
class Promisest {
    constructor(backPromisestFun, getPromiseData) {
        this.PromiseStatus = Promisest.data(getPromiseData).status;
        this.result = Promisest.data(getPromiseData).result;
        backPromisestFun && backPromisestFun(this.resolve.bind(this), this.reject.bind(this))
        this.rejectBackArr = null;
        this.resolveBackArr = null;
        this.res = null;
        this.rej = null;
    }

    resolve(result) {
        if (this.PromiseStatus === 'pending') {
            this.PromiseStatus = 'fulfilled';
            this.result = result;
            if (!this.res) {
                return new Promisest(() => {}, { status: this.PromiseStatus, result: this.result });
            }
            if (this.resolveBackArr) {
                this.res(this.resolveBackArr && this.resolveBackArr(this.result));
            } else {
                this.res(this.result);
            }
        }
    }

    reject(reason) {
        if (this.PromiseStatus === 'pending') {
            this.PromiseStatus = 'rejected';
            this.result = reason;
            if (!this.rej) {
                return new Promisest(() => {}, { status: this.PromiseStatus, result: this.result });
            }
            if (this.rejectBackArr) {
                this.res(this.rejectBackArr(this.result));
            } else {
                this.rej(this.result);
            }
        }
    }

    then(resBack, rejBack) {
        if (this.PromiseStatus === 'fulfilled') {
            this.result = resBack && resBack(this.result);
        } else if (this.PromiseStatus === 'rejected') {
            if (rejBack) {
                this.result = rejBack && rejBack(this.result);
                this.PromiseStatus = 'fulfilled';
            } 
        } else {
            this.resolveBackArr = resBack ? resBack : null;
            this.rejectBackArr = rejBack ? rejBack : null;
            return new Promisest((res,rej) => { this.res = res; this.rej = rej }, { status: this.PromiseStatus, result: this.result });
        }    
        return new Promisest(() => {  }, { status: this.PromiseStatus, result: this.result });
    }

    catch(catchBack) {
        if (this.PromiseStatus === 'rejected') {
            if (catchBack) {
                this.result = catchBack(this.result);
                this.PromiseStatus = 'fulfilled';
                return new Promisest(() => {}, { status: this.PromiseStatus, result: this.result });
            }
        } else {
            this.rejectBackArr = catchBack ? catchBack : null;
            return new Promisest((res,rej) => { this.res = res; this.rej = rej }, { status: this.PromiseStatus, result: this.result });
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
        // console.log('arr--------',arr)
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
    Promisest
}