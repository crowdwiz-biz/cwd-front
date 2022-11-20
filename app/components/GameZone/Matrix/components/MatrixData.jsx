import React from "react";
import Translate from "react-translate-component";
import {Progress} from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";

class MatrixData extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let percent = this.props.blocksPercent;
        let currentBlock = this.props.currentBlock;
        let startBlockNum = this.props.startBlockNum;

        let resultStart = this.props.resultStart;
        let resultFinish = this.props.resultFinish;

        return (
            <div className="matrix-body">
                <div className="matrix-body__inner">
                    <div className="matrix-body__progress-wrap">
                        <Progress
                            percent={percent}
                            theme={{active: {color: "#F2CB96"}}}
                        />
                    </div>

                    {startBlockNum - currentBlock < 0 ? (
                        <div className="matrix-body__blocks">
                            <span className="matrix-body__start-block-wrap">
                                {Math.round(percent * 100) / 100}
                                {"% "}
                            </span>

                            <span>
                                <Translate content="gamezone.matrix.block_percent_finish" />
                            </span>
                        </div>
                    ) : (
                        <div className="matrix-body__blocks">
                            <span className="matrix-body__start-block-wrap">
                                {Math.round(percent * 100) / 100}
                                {"% "}
                            </span>

                            <span className="matrix-body__blocks-text">
                                <Translate content="gamezone.matrix.block_percent_start" />
                            </span>
                        </div>
                    )}

                    {startBlockNum - currentBlock > 0 ? (
                        <div className="matrix-body__total-blocks-wrap">
                            <Translate
                                className="matrix-body__total-blocks-text"
                                content="gamezone.matrix.matrix_blocks_start"
                            />{" "}
                            <span className="matrix-body__total-blocks-num">
                                {!resultStart ? null : resultStart}
                            </span>
                        </div>
                    ) : (
                        <div className="matrix-body__total-blocks-wrap">
                            <Translate
                                className="matrix-body__total-blocks-text"
                                content="gamezone.matrix.matrix_blocks_finish"
                            />{" "}
                            <span className="matrix-body__total-blocks-num">
                                {!resultFinish ? null : resultFinish}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
export default MatrixData;
