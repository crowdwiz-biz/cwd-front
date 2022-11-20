import React from "react";
import Translate from "react-translate-component";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import WalletDb from "stores/WalletDb";
import {ChainStore} from "bitsharesjs";
import {connect} from "alt-react";
import NewIcon from "../NewIcon/NewIcon";

class ScoopForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userImg: this.props.apiUrl + "/static/cwd_preview.jpg",
            userPrice: 0,
            userTotal: 0,
            currentAccount: AccountStore.getState().currentAccount,
            userData: {},
            btnDisabled: true,
            imgResult: false
        };

        this.onDescriptionAdded = this.onDescriptionAdded.bind(this);
        this.onPriceAdded = this.onPriceAdded.bind(this);
        this.onTotalaValueAdded = this.onTotalaValueAdded.bind(this);
    }

    onDescriptionAdded(e) {
        this.setState({userDescription: e.target.value});
    }

    onPriceAdded(e) {
        this.setState({userPrice: e.target.value});
    }

    onTotalaValueAdded(e) {
        this.setState({userTotal: e.target.value});
    }

    lotteryAddLot(e) {
        e.preventDefault();
        if (this.props.account) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                    })
                    .catch(() => {});
            } else {
                let owner_id = this.props.account.get("id");
                let participants = this.state.userTotal;
                let ticket_price = this.state.userPrice * 100000;
                let img_url;
                if (this.state.userImg == "") {
                    img_url = this.props.apiUrl + "/static/cwd_preview.jpg";
                } else {
                    img_url = this.state.userImg;
                }
                let description = this.state.userDescription;

                AccountActions.lotteryAddLot(
                    owner_id,
                    participants,
                    ticket_price,
                    img_url,
                    description
                )
                    .then(() => {
                        TransactionConfirmStore.unlisten(this.onTrxIncluded);
                        TransactionConfirmStore.listen(this.onTrxIncluded);
                    })
                    .catch(err => {
                        console.log("error:", err);
                    });
            }
        } else {
            this.props.history.push("/create-account/password");
        }
    }

    loadImgToIpfs() {
        var file = document.getElementById("userLotImg");
        var formData = new FormData();

        formData.append("file0", file.files[0]);
        let fetchUrl = this.props.apiUrl + "/upload_scoop";

        fetch(fetchUrl, {
            method: "POST",
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                this.setState({
                    userImg: this.props.apiUrl + "/ipfs/" + data,
                    imgResult: true
                });
            })
            .catch(error => console.log(error));
    }

    render() {
        return (
            <div className="add-lot">
                <div className="add-lot__wrap">
                    <div className="add-lot__inner">
                        <label
                            className="add-lot__field-wrap"
                            htmlFor="userLotDescription"
                        >
                            <Translate
                                className="add-lot__subtitle"
                                content="gamezone.set-description"
                            />
                            <textarea
                                className="cwd-common__textarea"
                                id="userLotDescription"
                                rows="8"
                                onChange={this.onDescriptionAdded.bind(this)}
                            />
                        </label>
                        {/* upload field */}
                        <div className="add-lot__field-wrap">
                            <Translate
                                className="add-lot__subtitle"
                                content="crowdmarket.set-img"
                            />
                            <Translate
                                className="add-lot__subtitle add-lot__subtitle--text"
                                content="crowdmarket.set-img-text"
                            />
                            <label
                                className="cwd-upload__upload-label"
                                htmlFor="userLotImg"
                            >
                                <NewIcon
                                    iconWidth={50}
                                    iconHeight={50}
                                    iconName={"upload"}
                                />

                                {this.state.imgResult ? (
                                    <Translate
                                        className="cwd-upload__label-text"
                                        content="crowdmarket.file-ok"
                                        element="span"
                                    />
                                ) : (
                                    <Translate
                                        className="cwd-upload__label-text"
                                        content="crowdmarket.choose-file"
                                        element="span"
                                    />
                                )}
                            </label>
                            <input
                                className="cwd-upload__upload"
                                ref="userUploadInput"
                                id="userLotImg"
                                type="file"
                                name="img_url"
                                onChange={this.loadImgToIpfs.bind(this)}
                            />

                            <div className="add-lot__img-preview">
                                <img src={this.state.userImg} />
                            </div>
                        </div>
                        <label
                            className="add-lot__field-wrap"
                            htmlFor="userLotPrice"
                        >
                            <Translate
                                className="add-lot__subtitle"
                                content="gamezone.set-price"
                            />

                            <input
                                className="cwd-common__input"
                                id="userLotPrice"
                                type="number"
                                min="1"
                                onChange={this.onPriceAdded.bind(this)}
                            />
                        </label>
                        <label
                            className="add-lot__field-wrap"
                            htmlFor="userLotTotal"
                        >
                            <Translate
                                className="add-lot__subtitle"
                                content="gamezone.set-total"
                            />

                            <input
                                className="cwd-common__input"
                                id="userLotTotal"
                                type="number"
                                min="1"
                                onChange={this.onTotalaValueAdded.bind(this)}
                            />
                        </label>
                    </div>
                    <span
                        className="scoop-list__buy-btn"
                        onClick={this.lotteryAddLot.bind(this)}
                    >
                        <Translate content="gamezone.add-btn" />
                    </span>
                </div>
            </div>
        );
    }
}
export default ScoopForm = connect(ScoopForm, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});
