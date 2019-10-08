<template >
<view>
  <view class="add-address">
      <view class="add-form">
          <view class="form-item">
              <input class="input" @input="bindinputName" placeholder="姓名" :value="address.name" auto-focus/>
          </view>
          <view class="form-item">
              <input class="input" @input="bindinputMobile" :value="address.mobile" placeholder="手机号码"/>
          </view>
          <view class="form-item">
              <input class="input" :value="address.fullRegion" disabled="true" @click="chooseRegion" placeholder="省份、城市、区县"/>
          </view>
          <view class="form-item">
              <input class="input" @input="bindinputAddress" :value="address.address" placeholder="详细地址, 如街道、楼盘号等"/>
          </view>
          <view class="form-default">
              <text @click="bindIsDefault" :class="address.isDefault ? 'selected default-input' : 'default-input'">设为默认地址</text>
          </view>
      </view>
      <view class="btns">
          <button class="cannel" @click="cancel">取消</button>
          <button class="save" @click="save">保存</button>
      </view>
      <view class="region-select" v-if="openSelectRegion">
        <view class="hd">
          <view class="region-selected">
            <view :class="['item', { disabled: item.id == 0, selected: (regionType -1) === index }]"
            @click="selectRegionType" :data-region-type-index="index" v-for="(item, index) of selectRegionList" :key="item.id">
            {{item.name}}</view>
          </view>
          <view :class="selectRegionDone ? 'done' : 'disabled done'" @click="doneSelectRegion">确定</view>
        </view>
        <view class="bd">
          <view class="region-list">
            <view :class="item.selected ? 'selected item' : 'item'" @click="selectRegion" :data-region-index="index"
            v-for="(item, index) of regionList" :key="item.id">{{item.name}}</view>
          </view>
        </view>
      </view>
  </view>
  <view class="bg-mask" @click="cancelSelectRegion" v-if="openSelectRegion"></view>
</view>
</template>

<script>
import api from '@/utils/api'
import wx from 'wx'
import util from '@/utils/util'

export default {
  data () {
    return {
      address: {
        name: '',
        mobile: '',
        provinceId: 0,
        cityId: 0,
        districtId: 0,
        address: '',
        fullRegion: '',
        isDefault: 0
      },
      addressId: 0,
      openSelectRegion: false,
      selectRegionList: [
        { id: 0, name: '省份', parent_id: 1, type: 1 },
        { id: 0, name: '城市', parent_id: 1, type: 2 },
        { id: 0, name: '区县', parent_id: 1, type: 3 }
      ],
      regionType: 1,
      regionList: [],
      selectRegionDone: false
    }
  },
  async mounted () {
    // 清空表单
    if (this.$route.query.id) {
      this.addressId = parseInt(this.$route.query.id);
      await Promise.all([
        this.getAddressDetail()
      ])
    }
    this.getRegionList(1)
  },
  methods: {
    clearForm () {
      this.addressId = 0
      this.address = {
        name: '',
        mobile: '',
        provinceId: 0,
        cityId: 0,
        districtId: 0,
        address: '',
        fullRegion: '',
        isDefault: 0
      }
    },
    // 获取地址详情信息
    async getAddressDetail () {
      const res = await api.getAddressDetail({ id: this.addressId });
      if (res.rspCd === '00000') {
        this.address = res.data
        this.address.fullRegion = this.address.provinceNm + this.address.cityNm + this.address.districtNm
      }
    },
    // 获得对应级别的地市信息
    async getRegionList (regionId) {
      let regionType = this.regionType;
      const res = await api.getRegionList({ parentId: regionId });
      if (res.rspCd === '00000') {
        this.regionList = res.data.map(item => {
          // 找到已选择的
          if (regionType === item.type && this.selectRegionList[regionType - 1].id === item.id) {
            item.selected = true;
          } else {
            item.selected = false;
          }
          return item;
        })
      }
    },
    // 获得输入的电话号码
    bindinputMobile (event) {
      let address = this.address;
      address.mobile = event.target.value;
      this.address = address;
    },
    // 获得输入的收货人姓名
    bindinputName (event) {
      let address = this.address;
      address.name = event.target.value;
      this.address = address;
    },
    // 获得输入的地址
    bindinputAddress (event) {
      let address = this.address;
      address.address = event.target.value;
      this.address = address;
    },
    // 设置是否为默认地址
    bindIsDefault () {
      let address = this.address;
      address.isDefault = !address.isDefault;
      if (address.isDefault) {
        address.isDefault = 1
      } else {
        address.isDefault = 0
      }
      this.address = address;
    },
    // 计算3级地市是否都已选好
    setRegionDoneStatus () {
      let doneStatus = this.selectRegionList.every(item => {
        return item.id !== 0;
      });
      this.selectRegionDone = doneStatus;
    },
    // 展开地市选择浮窗
    chooseRegion () {
      this.openSelectRegion = !this.openSelectRegion;
      // 设置区域选择数据
      let address = this.address;
      if (address.provinceId > 0 && address.cityId > 0 && address.districtId > 0) {
        let selectRegionList = this.selectRegionList;
        selectRegionList[0].id = address.provinceId
        selectRegionList[0].name = address.provinceNm
        selectRegionList[0].parentId = 1;
        selectRegionList[1].id = address.cityId;
        selectRegionList[1].name = address.cityNm;
        selectRegionList[1].parentId = address.provinceId;
        selectRegionList[2].id = address.districtId;
        selectRegionList[2].name = address.districtNm;
        selectRegionList[2].parentId = address.cityId;
        this.selectRegionList = selectRegionList;
        this.regionType = 3;
        this.getRegionList(address.cityId);
      } else {
        this.selectRegionList = [
          { id: 0, name: '省份', parent_id: 1, type: 1 },
          { id: 0, name: '城市', parent_id: 1, type: 2 },
          { id: 0, name: '区县', parent_id: 1, type: 3 }
        ];
        this.regionType = 1;
        this.getRegionList(1);
      }
      this.setRegionDoneStatus();
    },
    // 选择不同级别的地市信息
    selectRegionType (event) {
      let regionTypeIndex = event.target.dataset.regionTypeIndex;
      let selectRegionList = this.selectRegionList;
      // 判断是否可点击
      if (regionTypeIndex + 1 === this.regionType || (regionTypeIndex - 1 >= 0 && selectRegionList[regionTypeIndex - 1].id <= 0)) {
        return false;
      }
      this.regionType = regionTypeIndex + 1;
      let selectRegionItem = selectRegionList[regionTypeIndex];
      this.getRegionList(selectRegionItem.parent_id);
      this.setRegionDoneStatus();
    },
    // 点击某一个地市名字
    selectRegion (event) {
      let regionIndex = event.target.dataset.regionIndex;
      let regionItem = this.regionList[regionIndex];
      let regionType = regionItem.type;
      let selectRegionList = this.selectRegionList;
      selectRegionList[regionType - 1] = regionItem;
      if (regionType !== 3) {
        this.selectRegionList = selectRegionList;
        this.regionType = regionType + 1;
        this.getRegionList(regionItem.id);
      } else {
        this.selectRegionList = selectRegionList;
      }
      // 重置下级区域为空
      selectRegionList.map((item, index) => {
        if (index > regionType - 1) {
          item.id = 0;
          item.name = index === 1 ? '城市' : '区县';
          item.parent_id = 0;
        }
        return item;
      });
      this.selectRegionList = selectRegionList;
      this.regionList = this.regionList.map(item => {
        // 找到已选择的
        if (this.regionType === item.type && this.selectRegionList[this.regionType - 1].id === item.id) {
          item.selected = true;
        } else {
          item.selected = false;
        }
        return item;
      })
      this.setRegionDoneStatus();
    },
    // 点击浮窗的确定
    doneSelectRegion () {
      if (this.selectRegionDone === false) {
        return false;
      }
      let address = this.address;
      let selectRegionList = this.selectRegionList;
      address.provinceId = selectRegionList[0].id;
      address.cityId = selectRegionList[1].id;
      address.districtId = selectRegionList[2].id;
      address.provinceNm = selectRegionList[0].name;
      address.cityNm = selectRegionList[1].name;
      address.districtNm = selectRegionList[2].name;
      address.fullRegion = selectRegionList.map(item => {
        return item.name;
      }).join('');
      this.address = address;
      this.openSelectRegion = false;
    },
    // 点击浮窗的背景遮罩，取消地市选择
    cancelSelectRegion () {
      this.openSelectRegion = false;
      this.regionType = this.regionDoneStatus ? 3 : 1;
    },
    // 点击底部“取消按钮”退出本页面
    cancel () {
      wx.navigateTo({
        url: '../ucenter/address'
      })
    },
    // 点击底部“保存按钮”保存地址
    async save () {
      let address = this.address;
      if (address.name === '') {
        util.showErrorToast('请输入姓名');
        return false;
      }
      if (address.mobile === '') {
        util.showErrorToast('请输入手机号码');
        return false;
      }
      if (address.districtId === 0) {
        util.showErrorToast('请输入省市区');
        return false;
      }
      if (address.address === '') {
        util.showErrorToast('请输入详细地址');
        return false;
      }
      // 组装请求参数
      const formObj = {
        id: this.addressId,
        name: address.name,
        mobile: address.mobile,
        provinceId: address.provinceId,
        cityId: address.cityId,
        districtId: address.districtId,
        address: address.address,
        isDefault: address.isDefault
      }
      // 判断是新增Or修改
      var res = {}
      if (this.addressId && this.addressId !== 0) {
        res = await api.updateAddress(formObj)
        if (res.rspCd === '00000') {
          this.clearForm()
          wx.showToast({
            title: '更改成功'
          })
          // 返回地址列表页面
          wx.navigateBack({
            url: '../ucenter/address'
          })
        }
      } else {
        res = await api.saveAddress(formObj)
        if (res.rspCd === '00000') {
          this.clearForm()
          wx.showToast({
            title: '添加成功'
          })
          // 返回地址列表页面
          wx.navigateBack({
            url: '../ucenter/address'
          })
        }
      }
    }
  },
  // 原生的分享功能
  onShareAppMessage: function () {
    return {
      title: 'Eshop',
      desc: '仿网易严选小程序商城',
      path: '/pages/ucenter/addressAdd'
    }
  }
}
</script>

<style scoped>
page{
    height: 100%;
    background: #f4f4f4;
}
.add-address .add-form{
    background: #fff;
    width: 100%;
    height: auto;
    overflow: hidden;
}

.add-address .form-item{
    height: 116rpx;
    padding-left: 31.25rpx;
    border-bottom: 1px solid #d9d9d9;
    display: flex;
    align-items: center;
    padding-right: 31.25rpx;
}

.add-address .input{
    flex: 1;
    height: 44rpx;
    line-height: 44rpx;
    overflow: hidden;
}

.add-address .form-default{
    border-bottom: 1px solid #d9d9d9;
    height: 75rpx;
    background: #fafafa;
    padding-top: 28rpx;
    font-size: 28rpx;
}

.default-input{
    margin: 0 auto;
    display: block;
    width: 240rpx;
    height: 40rpx;
    padding-left: 50rpx;
    line-height: 40rpx;
    background: url(~@/../static/images/checkbox_list.png) 1rpx -448rpx no-repeat;
    background-size: 38rpx 486rpx;
    font-size: 28rpx;
}

.default-input.selected{
    background: url(~@/../static/images/checkbox_list.png) 0 -192rpx no-repeat;
    background-size: 38rpx 486rpx;
}

.add-address .btns{
    position: fixed;
    bottom: 0;
    left: 0;
    overflow: hidden;
    display: flex;
    height: 100rpx;
    width: 100%;
}

.add-address .cannel,.add-address .save{
    flex: 1;
    height: 100rpx;
    text-align: center;
    line-height: 100rpx;
    font-size: 28rpx;
    color: #fff;
    border:none;
    border-radius: 0;
}

.add-address .cannel{
    background: #333;
}

.add-address .save{
    background: #b4282d;
}


.region-select{
  width: 100%;
  height: 600rpx;
  background: #fff;
  position: fixed;
  z-index: 10;
  left:0;
  bottom: 0;
}

.region-select .hd{
  height: 108rpx;
  width: 92%;
  border-bottom: 1px solid #f4f4f4;
  padding: 46rpx 30rpx 0 30rpx;
}

.region-select .region-selected{
  float: left;
  height: 60rpx;
  display: flex;
}

.region-select .region-selected .item{
  max-width: 140rpx;
  margin-right: 30rpx;
  text-align: left;
  line-height: 60rpx;
  height: 100%;
  color: #333;
  font-size: 28rpx;
  overflow: hidden;
      text-overflow: ellipsis;
    white-space: nowrap;
}

.region-select .region-selected .item.disabled{
  color: #999;
}

.region-select .region-selected .item.selected{
  color: #b4282d;
}

.region-select .done{
  float: right;
  height: 60rpx;
  width: 60rpx;
  border: none;
  background: #fff;
  line-height: 60rpx;
  text-align: center;
  color: #333;
  font-size: 28rpx;
}

.region-select .done.disabled{
  color: #999;
}



.region-select .bd{
  height: 492rpx;
  width: 100%;
  padding: 0 30rpx;
  overflow-y: auto;
}

.region-select .region-list{
  height: auto;
  overflow: scroll;

}

.region-select .region-list .item{
  width: 100%;
  height: 104rpx;
  line-height: 104rpx;
  text-align: left;
  color: #333;
  font-size: 28rpx;
}

.region-select .region-list .item.selected{
  color: #b4282d;
}


.bg-mask{
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  position: fixed;
  top:0;
  left:0;
  z-index: 8;
}

</style>
