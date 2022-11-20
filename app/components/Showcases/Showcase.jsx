import React, {Component} from "react";
import PropTypes from "prop-types";
import NewIcon from "../NewIcon/NewIcon";
import Translate from "react-translate-component";
import {Tooltip} from "crowdwiz-ui-modal";

export default class Showcase extends Component {
    static propTypes = {
        target: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
        comingSoon: PropTypes.bool
    };

    static defaultProps = {
        disabled: false
    };

    constructor() {
        super();
    }

    render() {
        if (!!this.props.disabled || !!this.props.comingSoon) {
            return (
                <Tooltip
                    title={
                        typeof this.props.disabled == "string"
                            ? this.props.disabled
                            : "Coming soon"
                    }
                >
                    <div
                        className="showcases-grid--wrapper--item--wrapper--disabled disabled"
                        onClick={() => {}}
                        tabIndex={"0"}
                    >
                        <h2 className={"no-margin"}>
                            {!!this.props.comingSoon && (
                                <NewIcon
                                    iconWidth={24}
                                    iconHeight={24}
                                    iconName={"coming_soon"}
                                />
                            )}
                            <Translate content={this.props.title} />
                        </h2>
                        <div
                            className={
                                "showcases-grid--wrapper--item--wrapper--content disabled"
                            }
                        >
                            <NewIcon
                                iconWidth={24}
                                iconHeight={24}
                                iconName={this.props.icon}
                            />
                            <span
                                className={
                                    "padding showcases-grid--wrapper--item--wrapper--content--description disabled"
                                }
                            >
                                <Translate content={this.props.description} />
                            </span>
                        </div>
                    </div>
                </Tooltip>
            );
        } else {
            return (
                <div
                    className="showcases-grid--wrapper--item--wrapper"
                    onClick={this.props.target}
                    tabIndex={"0"}
                >
                    <Translate
                        content={this.props.title}
                        className={"no-margin"}
                        component={"h2"}
                    />
                    <div
                        className={
                            "showcases-grid--wrapper--item--wrapper--content"
                        }
                    >
                        <NewIcon
                            iconWidth={24}
                            iconHeight={24}
                            iconName={this.props.icon}
                        />
                        <span
                            className={
                                "padding showcases-grid--wrapper--item--wrapper--content--description"
                            }
                        >
                            <Translate content={this.props.description} />
                        </span>
                    </div>
                </div>
            );
        }
    }
}
