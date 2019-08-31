


export default class Listnter {
    constructor() {
        this.Observers = {};
        this.temporaryData = {};
    }

    // 创建单例
    static getInstance() {
        if (!this.instance) {
            this.instance = new Listnter();
        }
        return this.instance;
    }

    /** 
     * @param {Object} target 消息监听this
     * @param {String} messageType 消息类型
     * @param {Function} callBack 消息回调function
    */
    registerMessageListenter(messageType, target, callBack) {
        if (!target || !callBack || !messageType) {
            return false;
        }
        if (!this.Observers[messageType]) {
            this.Observers[messageType] = [];
        }
        if (this.Observers[messageType].length > 0 && this._isSameLisenter(this.Observers[messageType], target)) {
            return false;
        }
        this.Observers[messageType].push({ messageType, target, callBack: callBack.bind(target) });
        return true;
    }

    /** 
     * @param {Object} target 销毁消息监听this
    */
    uninstallMessageListente(messageType, target) {
        if (!target || !messageType) {
            return false;
        }
        const __allNowType = this.Observers[messageType];
        const _arr = [];
        if (__allNowType && __allNowType.length > 0) {
            __allNowType.forEach((item) => {
                if (item.target !== target) {
                    _arr.push(item);
                }
            })
        }
        if (_arr.length === 0) {
            delete this.Observers[messageType];
            return true;
        }
        this.Observers[messageType] = [..._arr];
        return true;
    }

    /** 
     * @param {String} messageType 消息类型
     * @param  messageData 发送的消息数据
    */
    sendOutMessage(messageType, messageData) {
        if (!messageType || !messageData) {
            return false;
        }
        this._send(messageType, messageData);
    }

    getCurrentData(messageType) {
        if (!messageType) {
            return false;
        }
        if (this.temporaryData && this.temporaryData[messageType]) {
            return this.temporaryData[messageType].messageData;
        }
        return false;
    }

    _send(messageType, messageData) {
        const _allNowType = this.Observers[messageType];
        this._mergeData(messageType, messageData);
        if (_allNowType && _allNowType.length > 0) {
            _allNowType.forEach((item) => {
                item.callBack && item.callBack(messageData);
            })
        }
    }

    _mergeData(tp, data) {
        if (!this.temporaryData) {
            this.temporaryData = {};
        }
        this.temporaryData[tp] = { messageType: tp, messageData: data }
    }

    _isSameLisenter(arr, target) {
        return arr.some((item) => {
            return item.target === target;
        })
    }
}