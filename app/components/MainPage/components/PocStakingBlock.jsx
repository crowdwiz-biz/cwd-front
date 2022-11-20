import React from "react";
import Translate from "react-translate-component";
import PocStakingChart from "./utility/PocStakingChart";
import {Apis} from "bitsharesjs-ws";

// IMAGES
let pocTitleImg = require("assets/png-images/staking/mp_poc_staking_bg.png");
let poc_img = {
    poc_1: require("assets/svg-images/svg-common/main-page/poc-staking/poc_1.svg"),
    poc_3: require("assets/svg-images/svg-common/main-page/poc-staking/poc_3.svg"),
    poc_6: require("assets/svg-images/svg-common/main-page/poc-staking/poc_6.svg")
};

class PocStakingBlock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dgpo: {
                poc3_percent: 0,
                poc6_percent: 0,
                poc12_percent: 0
            }
        };
    }

    componentDidMount() {
        this.getDGPO();
    }

    getDGPO() {
        Apis.instance()
            .db_api()
            .exec("get_dynamic_global_properties", [])
            .then(dgpo => {
                this.setState({
                    dgpo: dgpo
                });
            });
    }

    render() {
        let monthPercent = this.state.dgpo;
        let poc_array = [
            {
                monthPercent: monthPercent.poc3_percent / 100,
                monthText: "month3",
                monthNum: poc_img.poc_3
            },
            {
                monthPercent: monthPercent.poc6_percent / 100,
                monthText: "month6",
                monthNum: poc_img.poc_6
            },
            {
                monthPercent: monthPercent.poc12_percent / 100,
                monthText: "year",
                monthNum: poc_img.poc_1
            }
        ];
        return (
            <section className="poc_block__width-layout">
                <div className="mp-center-wrap mp-common__inner">
                    <div className="mp-common__left-column">
                        <Translate
                            className="mp-common__title"
                            content="main_page.poc_block.title"
                            component="h2"
                        />

                        <Translate
                            className="mp-common__description mp-common__description--mobile-layout"
                            content="main_page.poc_block.description"
                        />
                    </div>

                    <div className="poc_block__right-column">
                        <img
                            src={pocTitleImg}
                            className="poc_block__title-img"
                            alt="poc stecking"
                        />

                        <div className="poc_block__charts-wrap">
                            {poc_array.map((item, i) => (
                                <PocStakingChart
                                    key={i}
                                    monthPercent={item.monthPercent}
                                    monthText={item.monthText}
                                    monthNum={item.monthNum}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

export default PocStakingBlock;
