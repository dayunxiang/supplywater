<style lang="less">
html,
body {
  width: 100%;
  height: 100%;
  font-size: 0.1rem;
  #container {
    width: 100%;
    height: 100%;
    display: flex;
    display: -webkit-flex;
    flex-direction: column;
  }
}
.main {
  flex: 1;
  width: 100% !important;
  overflow-y: auto;
  .ivu-scroll-container {
    height: 100% !important;
    .ivu-card-body {
      position: relative;
      p {
        line-height: 0.3rem;
      }
      img {
        position: absolute;
        right: 20px;
        top: 40%;
        width: 0.3rem;
      }
    }
  }
}
</style>

<template>
  <div id="container">
    <Spin size="large" fix v-if="spinShow"></Spin>
    <myHeader :title="title" search="inspectionMissionList" indexBack="true"></myHeader>
    <scroll class="main" :on-reach-bottom="handleReachBottom">
      <Card dis-hover v-for="(item, index) in list" class="list" :key="index">
        <div @click="toDetail(item.inspTaskPk)">
          <p>
            <span>区域：</span>
            {{item.districtNm}}
          </p>

          <p>
            <span>泵房名称：</span>
            {{item.estateNm}}
          </p>
          <p>
            <span>供水分区：</span>
            {{item.waterSupplyModeNm}}
          </p>
          <p>
            <span>设备套数：</span>
            {{item.deviceQty}}
          </p>
          <p>
            <span>巡检单位：</span>
            {{item.inspUnitNm}}
          </p>
          <p>
            <span>巡检时间：</span>
            {{item.inspectPlanTime}}
          </p>
          <p>
            <span>巡检人：</span>
            {{item.inspectorName}}
          </p>
          <p>
            <span>巡检状态：</span>
            {{item.taskExeStatus | state}}
          </p>
          <img src="../components/img/toDetail.png">
        </div>
      </Card>
    </scroll>
  </div>
</template>

<script>
import Loading from "../../../hero/components/loading";
import myHeader from "../components/myHead";
export default {
  data() {
    return {
      spinShow: false, //加载中
      title: "巡检任务",
      list: [],
      pageNo: 1,
      pageSize: 10,
      total: "",
      search: {
        //泵房名称
        estateNm: "",
        //巡检单位
        inspUnitCd: "",
        //开始时间
        inspectPlanTimeBeg: "",
        //结束时间
        inspectPlanTimeEnd: "",
        //供水模式
        waterSupplyModeCd: ""
      }
    };
  },
  components: {
    Loading,
    myHeader
  },
  mounted() {
    let myData = JSON.parse(this.until.getQueryString("search"));
    console.log(myData);

    if (myData) {
      /*  this.usageTm = myData.usageDate+' '+myData.usageTime
                this.handOverTm = myData.handOverDate+' '+myData.handOverTime
                this.districtCd = myData.districtCd
                this.estateNm = myData.estateNm
                this.phCd = myData.phCd */
      this.search.estateNm = myData.estateNm;
      this.search.inspUnitCd = myData.inspUnitCd;
      this.search.waterSupplyModeCd = myData.waterSupplyModeCd;
      this.search.inspectPlanTimeBeg = myData.inspectPlanTimeBeg;
      this.search.inspectPlanTimeEnd = myData.inspectPlanTimeEnd;
    }

    let cookieVal = this.until.getCookie("yui2-token");
    if (!cookieVal) {
      let promise = this.until.login();
      promise.then(res => {
        this.getList();
      });
    } else {
      this.getList();
    }
  },
  methods: {
    getList() {
      let $q = new Promise((resolve, reject) => {
        let query = new this.Query();
        // query.buildWhereClause('dealStatus',this.search.dealStatus,'LK');
        query.buildWhereClause("estateNm", this.search.estateNm, "LK");
        query.buildWhereClause("inspUnitCd", this.search.inspUnitCd, "LK");
        if (
          this.search.inspectPlanTimeBeg != null &&
          this.search.inspectPlanTimeBeg != undefined &&
          this.search.inspectPlanTimeBeg != ""
        ) {
          query.buildWhereClause(
            "inspectPlanTime",
            this.search.inspectPlanTimeBeg,
            "GE"
          );
          query.buildWhereClause(
            "inspectPlanTime",
            this.search.inspectPlanTimeEnd,
            "LE"
          );
        }
        // query.buildWhereClause('inspectPlanTimeBeg',this.search.inspectPlanTimeBeg,'GE');
        // query.buildWhereClause('inspectPlanTimeEnd',this.search.inspectPlanTimeEnd,'LE');
        query.buildWhereClause(
          "waterSupplyModeCd",
          this.search.waterSupplyModeCd,
          "LK"
        );
        query.buildWhereClause("taskExeStatus", "待巡检");
        query.buildPageClause(this.pageNo, this.pageSize);
        let param = query.getParam();
        console.log(param);

        this.until.get("/ph/inspTask/page", param).then(
          res => {
            this.spinShow = false;

            if (res.status == 200 && res.data.items) {
              this.list.push(...res.data.items);
              this.total = res.page.total;
            }
            resolve("ok");
          },
          err => {}
        );
      });
      return $q;
    },
    toDetail(ipPk) {
      let url = "inspectionMissionDetail.html?ipPk=" + ipPk;
      window.location.href = url;
      // this.app.InterfaceName('h5_Jump',url)
    },
    change(val) {
      this.type = val;
      this.list = [];
      this.listTotal = [];
      this.pageNo = 1;
      this.spinShow = true;
      this.getList();
    },
    //到底部时触发
    handleReachBottom() {
      return new Promise(resolve => {
        setTimeout(() => {
          if (this.list.length < this.total) {
            this.spinShow = true;
            this.pageNo++;
            this.getList();
          }
          resolve();
        }, 2000);
      });
    }
  },

  filters: {
    state(val) {
      if (val == 0) {
        val = "未确认";
      }
      if (val == 1) {
        val = "已确认";
      }
      if (val == 2) {
        val = "已接单";
      }
      if (val == 3) {
        val = "已处理";
      }
      if (val == 4) {
        val = "已回访";
      }
      if (val == 5) {
        val = "完成";
      }
      return val;
    }
  }
};
</script>


