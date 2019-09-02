import React from 'react';
import Dawn from "../../common/api.js";
import imgUrl from "./rm-his.jpg";
require('./search.css');
const STORAGE_SEARCH_HISTORY = 'search_history_storage';
const STORAGE_HISTORY_FLAG = 'history_flag_storage';
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
    const className = 'search-item';
    const active = 'active-item-color';
    const newArr = [];
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
         { !historyFlag && <div className='eyes' onClick = {this.openHistory.bind(this)}>0</div> }
        </div>
        <div className="search-content">
          {
            isUserWrite && val ? arr.map((item, Iindex) => {
              const isTrue = Iindex === index;
              newArr.push(isTrue);
              const newStr = newArr.includes(true) ? item : item.split(val).join(`<font color=red>${val}</font>`)
              return (
                <div className={isTrue ? active : className}
                  onClick={this.itemClick.bind(this, item, Iindex)}
                  key={item}>
                  <p dangerouslySetInnerHTML={{ __html: newStr }} />
                </div>
              )
            }) :
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
    this.setVal(_val, true);
    if (!_val) {
      this.setState({ arr: [] })
      return false;
    };
    Dawn.request({ url: './fake_data.json' }, (res) => {
      _this.setState({ arr: this.handleBackData(res, _val) });
    });
  }

  handleBackData(res, val) {
    return res.filter((item) => { return item.indexOf(val) !== -1 });
  }

  itemClick(val, index) {
    if (!this.isMultipleClicks) {
      this.isMultipleClicks = true;
      if (!val) return;
      this.setVal(val, false);
      this.setState({ index: index });
      this.confrimClick(val);
      setTimeout(() => { this.isMultipleClicks = false; }, 500)
    }
  }

  setVal(val, updateVal) {
    if (updateVal) {
      let isUserWrite = true;
      let index = this.state.index;
      let historyList = [];
      this.userVal = val;
      if (!val) {
        isUserWrite = false;
        index = -1;
        historyList = this.getHistoricalRecords();
      }
      this.setState({ isUserWrite, index, historyList });
    }
    this.setState({ val: val });
  }

  isAssociation(kc) {
    return ((kc === 38 || kc === 40)
      && (this.state.arr || this.state.historyList)
      && (this.state.arr.length > 0 || this.state.historyList.length > 0))
      || kc === 13;
  }

  keyCode(e) {
    const kc = e.keyCode || 0;
    const _val = this.refs.input.value || '';
    if (!this.isAssociation(kc)) return;
    const len = this.isSearch() ? this.state.arr.length : this.state.historyList.length;
    let last = this.state.index;
    if (kc === 38) {
      e.preventDefault();
      if (last === -1) {
        last = len;
      }
      this.setState({ index: --last, }, () => {
        this.setNowItem();
      });
    }
    if (kc === 40) {
      if (last === len - 1) {
        last = -2;
      }
      this.setState({ index: ++last }, () => {
        this.setNowItem();
      });
    }
    if (kc === 13) {
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
      this.setVal(_item);
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
    let existence = newArr.some((item) => { return item === val; })
    if (existence) return;
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
    if (!this.props.historyFlag) return;
    this.state = { rmHistoricalP: false };
  }


  /** 
   * history----html
  */
  render() {
    const { historyList, index, historyFlag } = this.props;
    const rmHistoricalP = this.state ? this.state.rmHistoricalP : false;
    if (!historyList || historyList.length === 0) return false;
    return (
      <div className="search-history" >
        {
          historyFlag ? historyList.map((item, hIndex) => {
            const isChoice = index === hIndex;
            return (
              <div
                className={isChoice ? 'history-item-color' : 'history-item'}
                key={item}
                onDoubleClick={this.onDoubleClick.bind(this, item, hIndex)}
                onClick={this.props.itemClick ? () => { this.props.itemClick(item, hIndex) } : ''}>
                {item}
              </div>
            )
          }) : ''
        }
        {
          historyFlag ?
            (<div className='close-history'>
              <div onClick={this.props.closeHistory}>关闭历史记录</div>
            </div>) : ''
        }
        {
          rmHistoricalP ?
            (<div className='rm-history-b'>
              <div>
                <img src={imgUrl} />
                <div onClick={this.rmHistory.bind(this, false)}>删除当前历史</div>
                <div onClick={this.rmHistory.bind(this, true)}>删除全部历史</div>
                <div onClick={this.rmBack.bind(this)}>返回</div>
              </div>
            </div>) : ''
        }
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
