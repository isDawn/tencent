/* eslint-disable no-const-assign */
/* eslint-disable no-unused-vars */
// import { Promisest } from "./Promise";
 class Dawn {
    /*** 
     * @param {Object} 入参
     * @param {Function} 回调
    */
    static request(param) {
        // return new Promisest((resolve, reject) => {
                fetch(param.url, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                }).then(
                    response => response.json()
                ).then(res => {
                    // resolve(res);
                })
        // })
    }


    /*** 
     * @param {String} funType // 方法类型
     * @param {Number} timer // 延时时间
    */
    static throttle(funType, timer) {
        const _this = this;
        if (!funType || !timer || !_this) {
            return false;
        }
        if (!_this.throttleObj) {
            _this.throttleObj = {};
        }
        const arr = _this.throttleObj[funType] || [];
        const timeStamp = new Date().getTime();
        if (arr && arr.length > 0 && arr[0] && arr[1] && timeStamp - arr[0] < arr[1]) {
            return true;
        } else {
            _this.throttleObj[funType] = [timeStamp, timer];
            return false;
        }
    }


    //  native-dawn.js


    /** 
     * @param {Object | Array} param_one
     * @param {Object | Array} param_two
     */

    static objCompare(param_one, param_two) {
        if (!this.isObj(param_one, param_two) && !this.isArray(param_one, param_two)) {
            throw new Error("Parameter type error");
        }
        return this.isSame(param_one, param_two);
    }

    static isSame(a, b) {
        if (!this.judgeLength(a, b)) return false;
        if (this.isArray(a, b)) {
            for (let i = 0, len = a.length; i < len; i++) {
                if (this.isArray(a[i], b[i]) || this.isObj(a[i], b[i])) {
                    if (!this.isSame(a[i], b[i])) return false;
                    continue;
                }
                if (a[i] !== b[i]) return false;
            }
            return true;
        }
        if (this.isObj(a, b)) {
            for (let key in a) {
                if (this.isArray(a[key], b[key]) || this.isObj(a[key], b[key])) {
                    if (!this.isSame(a[key], b[key])) return false;
                    continue;
                }
                if (a[key] !== b[key]) return false;
            }
            return true;
        }
        if (a !== b) return false;
        return true;
    }

    static judgeLength(a, b) {
        if (this.isObj(a, b)) {
            return Object.keys(a).length === Object.keys(b).length;
        }
        if (this.isArray(a, b)) {
            return a.length === b.length;
        }
    }

    static isObj(param_one, param_two) {
        return this._isObj(param_one) && this._isObj(param_two);
    }

    static isArray(param_one, param_two) {
        return this._isArray(param_one) && this._isArray(param_two);
    }

    static _isObj(value) {
        return Object.prototype.toString.call(value) === "[object Object]";
    }

    static _isArray(value) {
        return Object.prototype.toString.call(value) === "[object Array]";
    }

    /** 
     * 深拷贝
     * targetObj = {a:1};
     * sourceObj = {a:2,b:3};
     * case cloneDeep(targetObj,targetObj) // {a:1,b:2,c:3};
     * targetObj = [1,2];
     * sourceObj = [3,4];
     * case cloneDeep(targetObj,targetObj) // [1,2,3,4]};
     * 目标对象和源对象的类型必须是一致的 如不一致 返回源对象 ⚠️
    */
    static cloneDeep(target,source,flag) { 
        if (!source || (!this.isObj(target,source) && !this.isArray(target,source) && !flag) ) {
            return target;
        }
        if ( (this._isArray(source) && source.length <= 0)) {
            return [];
        }
        if ( (this._isObj(source) && Object.keys(source).length <= 0)) {
            return {};
        }
        let sourceObj = {};
		if (this._isObj(source)) {
				for (let key in source) {
					if (!this._isObj(source[key]) && !this._isArray(source[key])) {
						sourceObj[key] = source[key];
					} else {
						sourceObj[key] = cloneDeep(false,source[key],true);
					}
				}
        }
        if (Array.isArray(source)) {
            sourceObj = source.map((item) => {
                if (!this._isObj(item) && !this._isArray(item)) {
                    return item
                } else {
                    return cloneDeep(false,item,true);
                }
            })
        }
		return target ? this._isArray(target) ? [...target,...sourceObj] : {...target,...sourceObj} : sourceObj;
    }
}

// 获取Dawn源数据中可外部使用的function
const objCompare = Dawn.objCompare.bind(Dawn);
const request = Dawn.request.bind(Dawn);
const throttle = Dawn.throttle.bind(Dawn);
const cloneDeep = Dawn.cloneDeep.bind(Dawn);

// 抛出可用外部方法以供使用
export {
    request, //server请求
    throttle, // 时间戳节流
    objCompare, // 是否相同obj or array
    cloneDeep // 深拷贝
}