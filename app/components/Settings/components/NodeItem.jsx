import React from "react";
import NewIcon from "../../NewIcon/NewIcon";
import Translate from "react-translate-component";

//STYLES
import "../scss/node-item.scss";

class NodeItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let {
            nodeName,
            nodeUrl,
            isActive,
            canBeHidden,
            isHidden,
            canBeRemoved,
            latencyInfo,
            latencyValue,
            pingColor
        } = this.props;

        return (
            <div
                className={
                    isActive ? "node-item" : "node-item node-item--inactive"
                }
            >
                <div className="node-item__inner">
                    <div className="node-item__data-wrap">
                        <div className="node-item__data-row">
                            <span className="node-item__text">{nodeName}:</span>
                            <span className="node-item__ws-url">{nodeUrl}</span>
                        </div>
                        <div className="node-item__data-row">
                            <Translate
                                className="node-item__text"
                                content={`settings.${latencyInfo}`}
                            />

                            <span
                                className={
                                    "node-item__latency-value node-item__latency-value--" +
                                    pingColor
                                }
                            >
                                {latencyValue}
                            </span>
                        </div>
                    </div>

                    <div className="node-item__btn-block">
                        {canBeHidden && !isHidden && !canBeRemoved ? (
                            <span
                                className="node-item__btn"
                                onClick={this.props.hideNode}
                            >
                                <NewIcon
                                    iconWidth={18}
                                    iconHeight={18}
                                    iconName={"settings_node-show"}
                                />
                            </span>
                        ) : null}

                        {isHidden ? (
                            <span
                                className="node-item__btn"
                                onClick={this.props.showNode}
                            >
                                <NewIcon
                                    iconWidth={18}
                                    iconHeight={18}
                                    iconName={"settings_node-hide"}
                                />
                            </span>
                        ) : null}

                        {canBeRemoved ? (
                            <span
                                className="node-item__btn"
                                onClick={this.props.removeNode.bind(
                                    this,
                                    nodeName,
                                    nodeUrl
                                )}
                            >
                                <NewIcon
                                    iconWidth={12}
                                    iconHeight={12}
                                    iconName={"header_menu_btn-close"}
                                />
                            </span>
                        ) : null}

                        <span className="node-item__btn">
                            {isActive ? (
                                <NewIcon
                                    iconWidth={18}
                                    iconHeight={18}
                                    iconName={"settings_node-active"}
                                />
                            ) : (
                                <NewIcon
                                    iconWidth={18}
                                    iconHeight={18}
                                    iconName={"settings_node-inactive"}
                                    onClick={this.props.connectNode}
                                />
                            )}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

export default NodeItem;
