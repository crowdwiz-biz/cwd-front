import React from "react";
import Translate from "react-translate-component";
import {
    CircularProgressbarWithChildren,
    buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

class PocStakingChart extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let monthPercent = this.props.monthPercent;
        let monthText = this.props.monthText;
        let monthNum = this.props.monthNum;
        let beforePercent = 0;
        let afterPercent = 0;
        if (monthPercent > 100) {
            beforePercent = 100;
            afterPercent = monthPercent - 100;
        } else {
            beforePercent = monthPercent;
        }
        return (
            <div className="poc_block__chart">
                <CircularProgressbarWithChildren
                    value={beforePercent}
                    strokeWidth={1}
                    styles={buildStyles({
                        pathColor: "#DEC27F",
                        trailColor: "#000000"
                    })}
                >
                    <div style={{width: "88%"}}>
                        <CircularProgressbarWithChildren
                            value={afterPercent}
                            strokeWidth={1}
                            styles={buildStyles({
                                pathColor: "#DEC27F",
                                trailColor: "transparent"
                            })}
                        >
                            <div className="poc_block__data-wrap">
                                <img
                                    src={monthNum}
                                    className="poc_block__term"
                                    alt=""
                                />

                                <div className="poc_block__text-wrap">
                                    <Translate
                                        className="poc_block__text"
                                        content={
                                            "main_page.poc_block." + monthText
                                        }
                                    />
                                    <span className="poc_block__percent">
                                        {monthPercent}%
                                    </span>
                                </div>
                            </div>
                        </CircularProgressbarWithChildren>
                    </div>
                </CircularProgressbarWithChildren>
            </div>
        );
    }
}

export default PocStakingChart;
