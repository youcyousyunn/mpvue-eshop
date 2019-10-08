<template >
<view class="container">
    <view class="brand-info">
        <view class="name">
            <img class="img" :src="brand.appListPicUrl" background-size="cover"/>
            <view class="info-box">
                <view class="info">
                    <text class="txt">{{brand.name}}</text>
                    <text class="line"></text>
                </view>
            </view>
        </view>
        <view class="desc">
            {{brand.simpleDesc}}
        </view>
    </view>
    <view class="cate-item">
        <view class="b">
            <block v-for="(item, index) of goodsList" :key="index">
            <navigator :class="index % 2 == 0 ? 'item-b item' : 'item'" :url="'../goods/goods?id=' + item.id">
                <img class="img" :src="item.listPicUrl" background-size="cover"/>
                <text class="name">{{item.name}}</text>
                <text class="price">￥{{item.retailPrice}}</text>
            </navigator>
            </block>
        </view>
    </view>
</view>
</template>

<script>
import api from '@/utils/api'

export default {
  data () {
    return {
      id: 0,
      brand: {},
      goodsList: [],
      page: 1,
      size: 10,
      total: 1
    }
  },
  async mounted () {
    if (this.$route.query.id) {
      this.id = parseInt(this.$route.query.id);
    }
    await Promise.all([
      this.getBrandDetail()
    ])
  },

  methods: {
    // 获取品牌信息
    async getBrandDetail () {
      if (this.$route.query.id) {
        this.id = parseInt(this.$route.query.id);
      }
      const res = await api.getBrandDetail({ id: this.id });
      if (res.rspCd === '00000') {
        this.brand = res.data;
        // 获取该制造商的商品列表信息
        this.getGoodsList();
      }
    },

    // 获取商品列表信息
    async getGoodsList () {
      const res = await api.getGoodsList({ brandId: this.id, currentPage: this.page, pageSize: this.size });
      if (res.rspCd === '00000') {
        // 商品信息合并叠加
        this.goodsList = this.goodsList.concat(res.goodsList);
        // 总页码
        this.total = res.total;
      }
    }
  },

  // 页面触底，请求新的数据
  onReachBottom () {
    if (this.total > this.page) {
      this.page = this.page + 1;
    } else {
      return false;
    }
    // 请求数据
    this.getGoodsList();
  },

  // 原生的分享功能
  onShareAppMessage: function () {
    return {
      title: 'Eshop',
      desc: '仿网易严选小程序商城',
      path: '/pages/brand/brandDetail'
    }
  }
}
</script>

<style scoped>
page{
    background: #f4f4f4;
}
.brand-info .name{
    width: 100%;
    height: 290rpx;
    position: relative;
}

.brand-info .img{
    position: absolute;
    top:0;
    left:0;
    width: 100%;
    height: 290rpx;
}

.brand-info .info-box{
    position: absolute;
    top:0;
    left:0;
    width: 100%;
    height: 290rpx;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

.brand-info .info{
    display: block;
}

.brand-info .txt{
    display: block;
    height: 37.5rpx;
    font-size: 37.5rpx;
    color: #fff;
}

.brand-info .line{
    margin: 0 auto;
    margin-top: 16rpx;
    display: block;
    height: 2rpx;
    width: 145rpx;
    background: #fff;
}

.brand-info .desc{
    background: #fff;
    width: 92%;
    height: auto;
    overflow: hidden;
    padding: 41.5rpx 31.25rpx;
    font-size: 30rpx;
    color: #666;
    line-height: 41.5rpx;
    text-align: center;
}

.cate-item .b{
  width: 750rpx;
  height: auto;
  overflow: hidden;
  border-top: 1rpx solid #f4f4f4;
  margin-top: 20rpx;
}

.cate-item .b .item{
  float: left;
  background: #fff;
  width: 374rpx;
  padding-bottom: 33.333rpx;
  border-bottom: 1rpx solid #f4f4f4;
  height: auto;
  overflow: hidden;
  text-align: center;
}

.cate-item .b .item-b{
 border-right: 1rpx solid #f4f4f4;
}

.cate-item .item .img{
    margin-top: 10rpx;
  width: 302rpx;
  height: 302rpx;
}

.cate-item .item .name{
  display: block;
  width: 320rpx;
  height: 35rpx;
  padding: 0 20rpx;
  overflow: hidden;
  margin: 11.5rpx 0 22rpx 0;
  text-align: center;
  font-size: 30rpx;
  color: #333;
}

.cate-item .item .price{
  display: block;
  width: 365.625rpx;
  height: 30rpx;
  text-align: center;
  font-size: 30rpx;
  color: #b4282d;
}
</style>
