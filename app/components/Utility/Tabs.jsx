import React from "react";
import PropTypes from "prop-types";
import cnames from "classnames";
import {connect} from "alt-react";
import SettingsActions from "actions/SettingsActions";
import SettingsStore from "stores/SettingsStore";
import counterpart from "counterpart";
import {withRouter} from "react-router-dom";
import NewIcon from "../NewIcon/NewIcon";

require("./scss/cwd-tabs.scss");
require("./scss/underlined-tabs.scss");
require("./scss/tab-folder.scss");
require("./scss/tabs-btn-view.scss");
require("./scss/gr-tabs.scss");

/**
 *  Renders a tab layout, handling switching and optionally persists the currently open tab using the SettingsStore
 *
 *  props:
 *     setting: unique name to be used to remember the active tab of this tabs layout,
 *     tabsClass: optional classes for the tabs container div
 *     contentClass: optional classes for the content container div
 *
 *  Usage:
 *
 *  <Tabs setting="mySetting">
 *      <Tab title="locale.string.title1">Tab 1 content</Tab>
 *      <Tab title="locale.string.title2">Tab 2 content</Tab>
 *  </Tabs>
 *
 */

class Tab extends React.Component {
    static propTypes = {
        changeTab: PropTypes.func,
        isActive: PropTypes.bool.isRequired,
        index: PropTypes.number.isRequired,
        className: PropTypes.string,
        isLinkTo: PropTypes.string,
        subText: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    };

    static defaultProps = {
        isActive: false,
        index: 0,
        className: "",
        isLinkTo: "",
        subText: null
    };

    render() {
        let {
            isActive,
            index,
            changeTab,
            title,
            className,
            updatedTab,
            disabled,
            subText,
            counter
        } = this.props;

        let c = cnames({"is-active": isActive}, className);

        if (typeof title === "string" && title.indexOf(".") > 0) {
            title = counterpart.translate(title);
        }

        // dont string concetenate subText directly within the rendering, subText can be an object without toString
        // implementation, but valid DOM (meaning, don't do subText + "someString"

        if (this.props.collapsed) {
            // if subText is empty, dont render it, we dont want empty brackets added
            if (typeof subText === "string") {
                subText = subText.trim();
            }
            if (title.type === "span") {
                title = title.props.children[2];
            }
            return (
                <option value={index} data-is-link-to={this.props.isLinkTo}>
                    {title}
                    {updatedTab ? "*" : ""}
                    {subText && " ("}
                    {subText && subText}
                    {subText && ")"}
                </option>
            );
        }

        let tabItem;

        switch (this.props.title) {
            case "explorer.witnesses.title":
                tabItem = (
                    <span className="icon-tabs">
                        <NewIcon
                            iconWidth={18}
                            iconHeight={18}
                            iconName={"user"}
                        />
                    </span>
                );
                break;

            case "account.votes.workers_short":
                tabItem = (
                    <span className="icon-tabs">
                        <NewIcon
                            iconWidth={18}
                            iconHeight={18}
                            iconName={"hammers"}
                        />
                    </span>
                );
                break;

            case "explorer.committee_members.title":
                tabItem = (
                    <span className="icon-tabs">
                        <NewIcon
                            iconWidth={18}
                            iconHeight={18}
                            iconName={"committee_members"}
                        />
                    </span>
                );
                break;

            case "explorer.blocks.tab_title_01":
                tabItem = (
                    <span className="icon-tabs">
                        <NewIcon
                            iconWidth={45}
                            iconHeight={45}
                            iconName={"explorer_tab_explorer"}
                        />
                    </span>
                );
                break;

            case "explorer.blocks.tab_title_02":
                tabItem = (
                    <span className="icon-tabs">
                        <NewIcon
                            iconWidth={34}
                            iconHeight={44}
                            iconName={"explorer_tab_op_history"}
                        />
                    </span>
                );
                break;

            case "explorer.blocks.tab_title_03":
                tabItem = (
                    <span className="icon-tabs">
                        <NewIcon
                            iconWidth={41}
                            iconHeight={41}
                            iconName={"explorer_tab_last_blocks"}
                        />
                    </span>
                );
                break;
        }

        return (
            <li
                className={disabled ? c + " cwd-tabs__item" + "tab-disabled" : c + " cwd-tabs__item"}
                onClick={
                    !disabled
                        ? changeTab.bind(this, index, this.props.isLinkTo)
                        : null
                }
            >
                <a>
                    {tabItem && tabItem}
                    <span className="tab-title">
                        {title}
                        {updatedTab ? "*" : ""}
                    </span>
                    {counter ? (
                        <span className="tab-counter">
                            <span className="tab-counter__num">{counter}</span>
                        </span>
                    ) : null}
                    {subText && <div className="tab-subtext">{subText}</div>}
                </a>
            </li>
        );
    }
}

class Tabs extends React.Component {
    static propTypes = {
        setting: PropTypes.string,
        defaultActiveTab: PropTypes.number,
        segmented: PropTypes.bool
    };

    static defaultProps = {
        active: 0,
        defaultActiveTab: 0,
        segmented: true,
        contentClass: "",
        style: {}
    };

    constructor(props) {
        super();
        this.state = {
            activeTab: props.setting
                ? props.viewSettings.get(props.setting, props.defaultActiveTab)
                : props.defaultActiveTab,
            width: window.innerWidth
        };

        this._setDimensions = this._setDimensions.bind(this);
    }

    componentDidMount() {
        this._setDimensions();
        window.addEventListener("resize", this._setDimensions, {
            capture: false,
            passive: true
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        let nextSetting = nextProps.viewSettings.get(nextProps.setting);
        if (nextSetting !== this.props.viewSettings.get(this.props.setting)) {
            this.setState({
                activeTab: nextSetting
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this._setDimensions);
    }

    _setDimensions() {
        let width = window.innerWidth;

        if (width !== this.state.width) {
            this.setState({width});
        }
    }

    _changeTab(value, isLinkTo) {
        if (value === this.state.activeTab) return;
        // Persist current tab if desired

        if (isLinkTo !== "") {
            this.props.history.push(isLinkTo);
        }

        if (this.props.setting) {
            SettingsActions.changeViewSetting({
                [this.props.setting]: value
            });
        }
        this.setState({activeTab: value});

        if (this.props.onChangeTab) this.props.onChangeTab(value);
    }

    render() {
        let {children, contentClass, tabsClass} = this.props;
        const collapseTabs =
            this.state.width <= 768 && React.Children.count(children) > 4;

        let activeContent = null;

        let tabs = React.Children.map(children, (child, index) => {
            if (!child) {
                return null;
            }
            if (collapseTabs && child.props.disabled) return null;
            let isActive = index === this.state.activeTab;
            if (isActive) {
                activeContent = child.props.children;
            }

            return React.cloneElement(child, {
                collapsed: collapseTabs,
                isActive,
                changeTab: this._changeTab.bind(this),
                index: index
            });
        }).filter(a => a !== null);

        if (!activeContent) {
            activeContent = tabs[0].props.children;
        }

        return (
            <div className={cnames(this.props.className)}>
                {collapseTabs ? (
                    <select
                        value={this.state.activeTab}
                        className="cwd-tabs__select"
                        onChange={e => {
                            let ind = parseInt(e.target.value, 10);
                            this._changeTab(
                                ind,
                                e.target[ind].attributes["data-is-link-to"]
                                    .value
                            );
                        }}
                    >
                        {tabs}
                    </select>
                ) : (
                    <ul className={tabsClass + " noselect"}>{tabs}</ul>
                )}

                <div className={cnames("tab-content", contentClass)}>
                    {activeContent}
                </div>
            </div>
        );
    }
}

Tabs = connect(Tabs, {
    listenTo() {
        return [SettingsStore];
    },
    getProps() {
        return {viewSettings: SettingsStore.getState().viewSettings};
    }
});

Tabs = withRouter(Tabs);

export {Tabs, Tab};
