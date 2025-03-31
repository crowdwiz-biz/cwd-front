import React from "react";
import Translate from "react-translate-component";
import PocStakingChart from "./utility/PocStakingChart";
import {Apis} from "bitsharesjs-ws";

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
                monthNum: 3
            },
            {
                monthPercent: monthPercent.poc6_percent / 100,
                monthText: "month6",
                monthNum: 6
            },
            {
                monthPercent: monthPercent.poc12_percent / 100,
                monthText: "year",
                monthNum: 1
            }
        ];
        return (
            <section className="poc_block">
                <Translate
                    className="title"
                    content="main_page.poc_block.title"
                    component="h2"
                />

                <Translate
                    className="description"
                    content="main_page.poc_block.description"
                />
                <div className="charts-wrap">
                    {poc_array.map((item, i) => (
                        <PocStakingChart
                            key={i}
                            monthPercent={item.monthPercent}
                            monthText={item.monthText}
                            monthNum={item.monthNum}
                        />
                    ))}
                </div>
            </section>
        );
    }
}

export default PocStakingBlock;
