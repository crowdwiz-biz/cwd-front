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
        let index = this.props.index;
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
                    strokeWidth={0.2}
                    styles={buildStyles({
                        pathColor: "rgba(222, 194, 127, 1)",
                        trailColor: "rgba(222, 194, 127, 0.25)",
                        strokeLinecap: "butt",
                        path: {
                            transform: "rotate(0.25turn)",
                            transformOrigin: "center center",
                            strokeLinecap: "butt",
                        },
                        trail: {
                            strokeLinecap: "butt",
                        },
                    })}
                >
                    <div
                        className="wow animate__animated animate__fadeIn"
                        data-wow-duration="2s"
                        data-wow-delay={`${index * 0.4}s`}
                    >
                        <CircularProgressbarWithChildren
                            value={afterPercent}
                            strokeWidth={1/2}
                            styles={buildStyles({
                                pathColor: "#DEC27F",
                                trailColor: "transparent"
                            })}
                        >
                            <svg className="ellipse" xmlns="http://www.w3.org/2000/svg" width="202" height="122" viewBox="0 0 202 122" fill="none">
                                <path d="M20.8646 1C8.3883 17.7315 1 38.5005 1 61C1 83.4995 8.3883 104.269 20.8646 121M181.135 1C193.612 17.7315 201 38.5005 201 61C201 83.4995 193.612 104.269 181.135 121" stroke="#DEC27F" stroke-opacity="0.25"/>
                            </svg>
                            <div className="poc_block__data-wrap">

                                <div className="poc_block__text-wrap">
                                    <span className="label">
                                        {monthNum}&nbsp;
                                        <Translate
                                            content={
                                                "main_page.poc_block." + monthText
                                            }
                                        />
                                    </span>
                                    <span className="percent">
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
