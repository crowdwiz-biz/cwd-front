import React from "react";
import RatingWrap from "./RatingWrap";
import {
    RaceIndicatorDesktop,
    RaceIndicatorMobile
} from "./utility/RaceIndicator";

class RaceIndicatorWrap extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let deviceWidth = window.innerWidth;
        let currentPointStage = parseInt(0);
        let currentPointInterval = parseInt(123);
        let currentStage = this.props.currentStage;
        let daysLeft = 0;
        let pointInt=parseInt(5);
        let shortInt=parseInt(31);
        let longInt=parseInt(111);
        let shortIntSec = 7*60*60*24;
        let longIntSec = 21*60*60*24;
        let currentTime  = this.props.currentTime;
        let nextGrTime = this.props.nextGrTime;

        if (!/Z$/.test(currentTime)) {
            currentTime += "Z";
        }
        if (!/Z$/.test(nextGrTime)) {
            nextGrTime += "Z";
        }
        let currentTimeDate = new Date(currentTime);
        let nextGrTimeDate = new Date(nextGrTime);

        daysLeft=Math.floor((nextGrTimeDate-currentTimeDate) / (1000 * 60 * 60 * 24));

        let timeDifference = parseFloat(nextGrTimeDate-currentTimeDate)/1000;
        let LineKShort = 1-timeDifference/shortIntSec;
        let LineKLong = 1-timeDifference/longIntSec;

        let stageLength = [
            0,
            pointInt+LineKShort*shortInt,
            pointInt*1+shortInt+LineKLong*longInt,
            pointInt*1+shortInt*1+longInt*1+LineKShort*shortInt,
            pointInt*1+shortInt*2+longInt*1+LineKLong*longInt,
            pointInt*1+shortInt*2+longInt*2+LineKShort*shortInt,
            pointInt*1+shortInt*3+longInt*2+LineKLong*longInt,
            pointInt*1+shortInt*3+longInt*3+LineKShort*shortInt,
            pointInt*1+shortInt*4+longInt*3+LineKShort*shortInt,
            pointInt*1+shortInt*5+longInt*3+LineKLong*longInt,
            pointInt*1+shortInt*5+longInt*4+LineKShort*shortInt,
            pointInt*1+shortInt*6+longInt*4+LineKLong*longInt,
            pointInt*1+shortInt*6+longInt*5+LineKShort*shortInt,
            pointInt*1+shortInt*7+longInt*5+LineKLong*longInt,
            pointInt*1+shortInt*7+longInt*6+LineKShort*shortInt
        ]
        let mobileInt = [
            0,
            parseInt(LineKShort*100),
            parseInt(LineKLong*100),
            parseInt(LineKShort*100),
            parseInt(LineKLong*100),
            parseInt(LineKShort*100),
            parseInt(LineKLong*100),
            parseInt(LineKShort*100),
            parseInt(LineKShort*100),
            parseInt(LineKLong*100),
            parseInt(LineKShort*100),
            parseInt(LineKLong*100),
            parseInt(LineKShort*100),
            parseInt(LineKLong*100),
            parseInt(LineKShort*100)
        ];
        currentPointStage= stageLength[this.props.currentStage];
        currentPointInterval=currentPointStage+40;
        if (deviceWidth > 576 && deviceWidth <= 768) {
            if (currentStage<=7) {
                currentPointStage=currentPointStage*920/636;
            }
            else{
                currentPointStage=(currentPointStage-920/2)*920/636;
            }
            
        }
        return (
            <div className="gr-indicator">
                {deviceWidth > 576 ? (
                    <RaceIndicatorDesktop
                        currentPointStage={currentPointStage}
                        currentStage={currentStage}
                        daysLeft={daysLeft}
                    />
                ) : (
                    <RaceIndicatorMobile
                        currentPointInterval={mobileInt[this.props.currentStage]*330/100+pointInt}
                        currentStage={currentStage}
                        daysLeft={daysLeft}
                    />
                )}

                <RatingWrap currentAccount={this.props.currentAccount} />
            </div>
        );
    }
}

export default RaceIndicatorWrap;
