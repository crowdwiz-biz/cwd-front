import React from "react";
import Translate from "react-translate-component";
import {Link} from "react-router-dom";
import NewIcon from "../NewIcon/NewIcon";
import {isIOS} from "react-device-detect";

let start = require("assets/svg-images/svg-common/contracts-icons/start.svg");
let expert = require("assets/svg-images/svg-common/contracts-icons/expert.svg");
let citizen = require("assets/svg-images/svg-common/contracts-icons/citizen.svg");
let infinity = require("assets/svg-images/svg-common/contracts-icons/infinity.svg");
let client = require("assets/svg-images/svg-common/contracts-icons/client.svg");

class AccountStructureItem extends React.Component {
    constructor(props, context) {
        super(props);

        // this.selectValue = this.selectValue.bind(this);

        this.state = {
            showClipboardMsg: null
        };
    }

    _copyToBuffer() {
        let apiUrl = this.props.apiUrl;
        var copyBtn = document.getElementById(
            apiUrl + `/?r=${this.props.contractData.name}`
        );
        copyBtn.classList.remove("referral-link__note--fadeIn");

        var copyText = apiUrl + `/?r=${this.props.contractData.name}`;
        var temp = document.createElement("textarea");

        temp.value = copyText;
        temp.style.position = "absolute";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);

        temp.select();
        document.execCommand("copy", false, copyText);
        document.body.removeChild(temp);
        copyBtn.classList.add("referral-link__note--fadeIn");
    }

    selectValue(id, e) {
        document.getElementById(id).select();
    }

    render() {
        let contracts = ["Client", "Start", "Expert", "Citizen", "Infinity"];
        let width = window.innerWidth;
        let apiUrl = this.props.apiUrl;

        return (
            <li
                className="structure-item structure-item__row"
                id={this.props.contractData.name}
            >
                <div className="structure-mobile">
                    {width < 600 ? (
                        <div className="structure-item__img-wrap">
                            {this.props.contractData.status == 0 ? (
                                <img
                                    className="structure-item__img"
                                    src={client}
                                />
                            ) : null}
                            {this.props.contractData.status == 1 ? (
                                <img
                                    className="structure-item__img"
                                    src={start}
                                />
                            ) : null}
                            {this.props.contractData.status == 2 ? (
                                <img
                                    className="structure-item__img"
                                    src={expert}
                                />
                            ) : null}
                            {this.props.contractData.status == 3 ? (
                                <img
                                    className="structure-item__img"
                                    src={citizen}
                                />
                            ) : null}
                            {this.props.contractData.status == 4 ? (
                                <img
                                    className="structure-item__img"
                                    src={infinity}
                                />
                            ) : null}
                        </div>
                    ) : null}

                    {width < 600 ? (
                        <div className="structure-mobile__wrap">
                            <div className="structure-mobile__item">
                                <div className="structure-mobile__raw">
                                    <span className="structure-mobile__user-data">
                                        <Translate
                                            content="account.structure.name"
                                            component="span"
                                        />
                                    </span>
                                    <span className="structure-mobile__user-data structure-mobile__user-name--value">
                                        <Link
                                            to={`/account/${this.props.contractData.name}/structure`}
                                        >
                                            {this.props.contractData.name}
                                        </Link>
                                    </span>
                                </div>
                            </div>
                            <div className="structure-mobile__item">
                                <div className="structure-mobile__raw">
                                    <div className="structure-item__ref-wrapper">
                                        <input
                                            className="referral-link"
                                            id={`refLink${this.props.contractData.name}`}
                                            defaultValue={
                                                apiUrl +
                                                `/?r=${this.props.contractData.name}`
                                            }
                                            onClick={() =>
                                                this.selectValue(
                                                    `refLink${this.props.contractData.name}`
                                                )
                                            }
                                        />
                                        {!isIOS ? (
                                            <div className="acc-btn acc-btn--wrap">
                                                <Translate
                                                    className="referral-link__note"
                                                    id={
                                                        apiUrl +
                                                        `/?r=${this.props.contractData.name}`
                                                    }
                                                    content="general.note-copy"
                                                />
                                                <div
                                                    className="acc-btn__block"
                                                    onClick={this._copyToBuffer.bind(
                                                        this,
                                                        apiUrl +
                                                            `/?r=${this.props.contractData.name}`
                                                    )}
                                                >
                                                    <NewIcon
                                                        iconWidth={16}
                                                        iconHeight={16}
                                                        iconName={"copy"}
                                                    />
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="structure-item__block structure-item__row">
                    {width > 600 ? (
                        <div className="structure-item__inner structure-item__column structure-item__name">
                            <span className="structure-item__data structure-item__title-mob ">
                                <Translate
                                    content="account.structure.name"
                                    component="span"
                                />
                            </span>
                            <div className="structure-item__img-wrap">
                                {this.props.contractData.status == 0 ? (
                                    <img
                                        className="structure-item__img"
                                        src={client}
                                    />
                                ) : null}
                                {this.props.contractData.status == 1 ? (
                                    <img
                                        className="structure-item__img"
                                        src={start}
                                    />
                                ) : null}
                                {this.props.contractData.status == 2 ? (
                                    <img
                                        className="structure-item__img"
                                        src={expert}
                                    />
                                ) : null}
                                {this.props.contractData.status == 3 ? (
                                    <img
                                        className="structure-item__img"
                                        src={citizen}
                                    />
                                ) : null}
                                {this.props.contractData.status == 4 ? (
                                    <img
                                        className="structure-item__img"
                                        src={infinity}
                                    />
                                ) : null}
                            </div>
                            <div className="structure-item__name-wrapper">
                                <span className="structure-item__data structure-item__data--value structure-item__data--name">
                                    <Link
                                        to={`/account/${this.props.contractData.name}/structure`}
                                    >
                                        {this.props.contractData.name}
                                    </Link>
                                </span>
                                <span className="structure-item__data structure-item__data--value">
                                    {contracts[this.props.contractData.status]}
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {width > 600 ? (
                        <div className="structure-item__inner structure-item__inner--link structure-item__column">
                            <span className="structure-item__data structure-item__title-mob">
                                <Translate
                                    content="account.structure.ref-link"
                                    component="span"
                                />
                            </span>
                            <div className="structure-item__ref-wrapper">
                                <div className="acc-btn acc-btn--wrap">
                                    <Translate
                                        className="referral-link__note"
                                        id={
                                            apiUrl +
                                            `/?r=${this.props.contractData.name}`
                                        }
                                        content="general.note-copy"
                                    />
                                    <div
                                        className="acc-btn__block"
                                        onClick={this._copyToBuffer.bind(
                                            this,
                                            apiUrl +
                                                `/?r=${this.props.contractData.name}`
                                        )}
                                    >
                                        <NewIcon
                                            iconWidth={16}
                                            iconHeight={16}
                                            iconName={"copy"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {width < 600 ? (
                        <div className="structure-item__inner">
                            <span className="structure-item__data">
                                <Translate
                                    content="account.structure.contract"
                                    component="span"
                                />
                            </span>
                            <span className="structure-item__data structure-item__data--value structure-item__data--contract">
                                {contracts[this.props.contractData.status]}
                            </span>
                        </div>
                    ) : null}

                    <div className="structure-item__inner structure-item__column">
                        <span className="structure-item__data structure-item__title-mob">
                            <Translate
                                content="account.structure.leader-value"
                                component="span"
                            />
                        </span>
                        <span className="structure-item__data structure-item__data--value">
                            {this.props.contractData.leaders_level}
                        </span>
                    </div>
                    <div className="structure-item__inner structure-item__column">
                        <span className="structure-item__data structure-item__title-mob">
                            <Translate
                                content="account.structure.total-levels"
                                component="span"
                            />
                        </span>
                        <span className="structure-item__data structure-item__data--value">
                            {this.props.contractData.depth}
                        </span>
                    </div>
                    <div className="structure-item__inner structure-item__column">
                        <span className="structure-item__data structure-item__title-mob">
                            <Translate
                                content="account.structure.leaders"
                                component="span"
                            />
                        </span>
                        <span className="structure-item__data structure-item__data--value">
                            {this.props.contractData.total_leaders}
                        </span>
                    </div>
                    <div className="structure-item__inner structure-item__column">
                        <span className="structure-item__data structure-item__title-mob">
                            <Translate
                                content="account.structure.total-team"
                                component="span"
                            />
                        </span>
                        <span className="structure-item__data structure-item__data--value">
                            {this.props.contractData.total_down}
                        </span>
                    </div>
                </div>
            </li>
        );
    }
}

export default AccountStructureItem;
