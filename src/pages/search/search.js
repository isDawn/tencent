/* eslint-disable react/jsx-no-comment-textnodes */
import React from 'react';
import {request} from "../../common/api.js";
import {Content,CloseHistory,ClearHistory,HistoryContent,Switch} from "./copmonent";
import Oath from "../../common/Promise.js";
require('./search.css');
const STORAGE_SEARCH_HISTORY = 'search_history_storage';
const STORAGE_HISTORY_FLAG = 'history_flag_storage';


/** 
 * search ***
*/
export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({
      arr: [],
      index: -1,
      historyFlag: true,
      historyList: [],
    }, props);
  }

  /**
   *  html seciton
   */
  render() {
    const { arr = [], val, historyFlag, historyList, isUserWrite, index } = this.state;
    return (
      <div className="search-b">
        <div className = 'input-and-eye'>
          <input className="search-input" ref='input'
            value={val || ''}
            placeholder="请输入"
            onFocus={this.onLoseAndObtainFocus.bind(this)}
            onBlur={this.onLoseAndObtainFocus.bind(this)}
            onKeyDown={this.keyCode.bind(this)}
            onChange={this.onChange.bind(this)}
          />
          <Switch 
            historyFlag = {historyFlag}
            openHistory = {this.openHistory.bind(this)}
          />
        </div>
        <div className="search-content">
          {
            isUserWrite && val ? 
              <Content
                index = {index}
                val = {val}
                arr = {arr}
                itemClick = {this.itemClick.bind(this)}
              />
              :
              <History
                historyFlag={historyFlag}
                historyList={historyList}
                index={index}
                itemClick={this.itemClick.bind(this)}
                closeHistory={this.closeHistory.bind(this)}
                rmHistoricalRecords={this.rmHistoricalRecords.bind(this)}
              /> 
          }
        </div>
      </div>
    )
  }

  /** 
   * 组件加载
  */
  componentDidMount() {
    this.setState({historyFlag:this.getHistoryFlag()});
  }


  /**
   * 组件卸载
   */
  componentWillUnmount() { }

  onChange() {
    const _val = this.refs.input.value || '';
    const _this = this;
    if (!_this.setValue(_val, true)) {
      return false;
    }
    request({ url: './fake_data.json' }).then((res)=>{
      _this.setState({ arr: this.handleBackData(res, _val) });
    }).catch((err)=>{
      // TODO 
    })
  }

  handleBackData(res, val) {
    return res.filter((item) => { return item.indexOf(val) !== -1 });
  }

  itemClick(val, index) {
    console.log('----')
    if (!this.isMultipleClicks) {
      this.isMultipleClicks = true;
      this.setState({ index, val});
      this.confrimClick(val);
      setTimeout(() => { this.isMultipleClicks = false; }, 500)
    }
  }

  setValue(val, updateUserChoice) {
    let { isUserWrite, index, arr, historyList } = this.state;
    let status = true;
    if (updateUserChoice) {
      this.userVal = val;
      isUserWrite  = true;
    }
    if (!val) {
      status = false;
      isUserWrite = false;
      arr = [];
      index = -1;
      historyList = this.getHistoricalRecords();
    }
    this.setState({val, isUserWrite, index, historyList, arr});
    return status;
  }

  isAssociation(kc) {
    return ((kc === 38 || kc === 40)
      && (this.state.arr || this.state.historyList)
      && (this.state.arr.length > 0 || this.state.historyList.length > 0))
      || kc === 13;
  }

  keyCode(e) {
    const code = e.keyCode || 0;
    const _val = this.refs.input.value || '';
    if (!this.isAssociation(code)) return;
    const len = this.isSearch() ? this.state.arr.length : this.state.historyList.length;
    let last = this.state.index;
    if (code === 38) {
      e.preventDefault();
      if (last === -1) {
        last = len;
      }
      this.setState({ index: --last, }, () => {
        this.setNowItem();
      });
    }
    if (code === 40) {
      if (last === len - 1) {
        last = -2;
      }
      this.setState({ index: ++last }, () => {
        this.setNowItem();
      });
    }
    if (code === 13) {
      this.confrimClick(_val);
    }
  }

  isSearch() {
    return this.state.val && this.state.isUserWrite;
  }

  setNowItem() {
    const { index, arr, historyList } = this.state;
    const newArr = this.isSearch() ? arr : historyList;
    if (newArr && newArr.length > 0) {
      let _item = newArr.filter((item, pIndex) => {
        return pIndex === index;
      })
      if (index === -1) {
        _item = this.userVal;
      }
      this.setValue(_item,false);
    }
  }


  onLoseAndObtainFocus(e) {
    const tp = e.type || '';
    const _index = -1;
    if (tp === 'focus') {
      // 聚焦
      this.setState({ index: _index });
      this.onChange(); //聚焦时请求下数据刷新 防止还是上次数据
      if (tp === 'blur') {
        // 失焦
      };
    }
  }

  /*** 
   * @param {String} val 用户选中的内容
  */
  confrimClick(val) {
    if (!val) return false;
    console.log('click confirm ?', val)
    this.setHistoricalRecords(val);
  }


  /*** 
   * const STORAGE_SEARCH_HISTORY : search_history_storage;
  */
  setHistoricalRecords(val) {
    let newArr = this.getHistoricalRecords();
    if (newArr.some((item) => { return item === val; })) return;
    newArr.push(val);
    console.log('set_storage---', newArr)
    localStorage.setItem(STORAGE_SEARCH_HISTORY, JSON.stringify(newArr));
  }

  getHistoricalRecords() {
    const getStorageData = localStorage.getItem(STORAGE_SEARCH_HISTORY) || '[]';
    return JSON.parse(getStorageData);
  }

  rmHistoricalRecords(v, i, f) {
    const his = this.getHistoricalRecords();
    this.rmAll();
    if (f || his.length <= 1) return;
    const newHistoryData = his.filter((item, index) => { return i !== index })
    newHistoryData.forEach((item) => {
      this.setHistoricalRecords(item);
    })
    this.setState({ historyList: newHistoryData });
  }

  rmAll() {
    localStorage.removeItem(STORAGE_SEARCH_HISTORY);
    this.setState({ historyList: [], val: '' });
  }

  closeHistory() {
    this.setState({ historyFlag: false });
    localStorage.setItem(STORAGE_HISTORY_FLAG, JSON.stringify({show:false}));
  }

  openHistory() {
    this.setState({ historyFlag: true });
    localStorage.setItem(STORAGE_HISTORY_FLAG, JSON.stringify({show:true}));
  }

  getHistoryFlag() {
    const getStorageData = localStorage.getItem(STORAGE_HISTORY_FLAG) || false;
    return getStorageData ? JSON.parse(getStorageData).show : false;
  }
}




// history

export class History extends React.Component {
  constructor(props) {
    super(props)
    this.props = props;
    this.state = { rmHistoricalP: false };
  }

  /** 
   * history----html
  */
  render() {
    const { historyList, index, historyFlag } = this.props;
    const rmHistoricalP = this.state ? this.state.rmHistoricalP : false;
    return (
      <div className="search-history" >
        <HistoryContent
          itemClick = {this.props.itemClick}
          onDoubleClick = {this.onDoubleClick.bind(this)}
          historyFlag = {historyFlag}
          index = {index}
          historyList = {historyList}
        />
        <CloseHistory 
          closeHistory = {this.props.closeHistory}
          historyFlag = {historyFlag}
          historyList = {historyList}
        />
        <ClearHistory 
          rmHistoricalP = {rmHistoricalP}
          rmBack = {this.rmBack.bind(this)}
          rmHistory = {this.rmHistory.bind(this)}
        />
      </div>
    )
  }

  onDoubleClick(item, index) {
    this.historyItem = item;
    this.historyIndex = index;
    this.setState({ rmHistoricalP: true });
  }

  rmBack() {
    this.setState({ rmHistoricalP: false });
  }

  rmHistory(flag) {
    this.rmBack();
    this.props.rmHistoricalRecords(this.historyItem, this.historyIndex, flag);
  }
}
