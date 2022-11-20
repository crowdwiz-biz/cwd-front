import React from "react";
import { Link } from "react-router-dom";
import AccountLink from "../utility/AccountLink";
import { linkData } from "../utility/LinkData";
import Transfer from "../../Modal/Transfer";
import SendMessage from "../../SendMessage/SendMessage";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import { ChainStore } from "bitsharesjs";
import NewIcon from "../../NewIcon/NewIcon";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import { Apis } from "bitsharesjs-ws";


// CONTRACT ICONS
let start = require("assets/svg-images/svg-common/contracts-icons/start.svg");
let expert = require("assets/svg-images/svg-common/contracts-icons/expert.svg");
let citizen = require("assets/svg-images/svg-common/contracts-icons/citizen.svg");
let infinity = require("assets/svg-images/svg-common/contracts-icons/infinity.svg");
let client = require("assets/svg-images/svg-common/contracts-icons/client.svg");

class AddressCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            linkData: linkData,
            isMessageModalVisible: false,
            isDescriptionEdit: false,
            accountDescription: "",
            isContactAdded: false,
            isDexDisabled: true,
            inspectedAccount: null,
            isSelectOpened: false
        }
        this._updateState = this._updateState.bind(this);
    }

    UNSAFE_componentWillMount() {
        ChainStore.subscribe(this._updateState);

        let inspectedAccId = this.props.inspectedAccId;

        Apis.instance()
            .db_api()
            .exec("get_my_p2p_adv", [inspectedAccId, 1])
            .then(activetrades => {
                if (activetrades.length > 0) {
                    this.setState({
                        isDexDisabled: false
                    });
                }
            });
        let inspectedAccount = ChainStore.getAccount(this.props.inspectedAccId);
        this.findAccount(inspectedAccount);
    }

    componentWillUnmount() {
        ChainStore.unsubscribe(this._updateState);
    }

    _updateState() {
        // GET ACCOUNT
        let inspectedAccount = ChainStore.getAccount(this.props.inspectedAccId);
        if (this.state.inspectedAccount === null) {
            if (inspectedAccount) {
                this.findAccount(inspectedAccount)
            }
        }
        else {
            if ((inspectedAccount && inspectedAccount.get("name") != this.state.inspectedAccount.get("name")) || inspectedAccount === null) {
                this.findAccount(inspectedAccount)
            }
        }
    }

    findAccount(inspectedAccount) {
        if (inspectedAccount) {
            this.setState({
                inspectedAccount: inspectedAccount
            });
        }
        if (inspectedAccount === null) {
            this.setState({
                inspectedAccount: null
            });
        }
    }

    //SHOW DEX
    navigateDexItems = (accountId, e) => {
        e.preventDefault();

        this.props.history.push(`gateway/dex?filter=${accountId}`);
    };

    // TRANSFER MODAL
    showTransfer = e => {
        e.preventDefault();

        let isScam = false;
        let scamAccounts = ChainStore.fetchFullAccount("scam-accounts");

        if (this.props.currentAccount && scamAccounts) {
            isScam =
                scamAccounts
                    .get("blacklisted_accounts")
                    .indexOf(this.props.currentAccount.get("id")) >= 0;

            if (!isScam) {
                if (WalletDb.isLocked()) {
                    WalletUnlockActions.unlock()
                        .then(() => {
                            AccountActions.tryToSetCurrentAccount();
                            if (this.send_modal) this.send_modal.show();
                        })
                        .catch(() => { });
                } else {
                    if (this.send_modal) this.send_modal.show();
                }
            } else {
                this.props.history.push("/");
            }
        }
    };

    // MESSAGE MODAL
    showMessageModal() {
        this.setState({
            isMessageModalVisible: true
        })
    }

    closeMessageModal() {
        this.setState({
            isMessageModalVisible: false
        })
    }

    // DESCRIPTION UNPUT
    handleDescription() {
        const isDescriptionEdit = this.state.isDescriptionEdit;

        this.setState({
            isDescriptionEdit: !isDescriptionEdit
        });

        if (this.state.isDescriptionEdit && this.state.accountDescription.length > 0) {
            this.addToContacts();
        }
    }

    editDescription(e) {
        this.setState({
            accountDescription: e.target.value
        })
    }

    addToContacts() {
        let inspectedAccId = this.props.inspectedAccId;
        let accountDescription = this.state.accountDescription;
        let lsAddressBook = JSON.parse(localStorage.getItem("__cwd__addressBook"));

        if (lsAddressBook === null) {
            lsAddressBook = {};
        }
        lsAddressBook[inspectedAccId] = accountDescription;
        localStorage.setItem("__cwd__addressBook", JSON.stringify(lsAddressBook));

        // SHOW ALERT
        this.setState({
            isContactAdded: true
        });

        this.timer = setTimeout(() => {
            this.setState({ isContactAdded: false });
        }, 2000);
    }

    removeFromContacts(accountId) {
        let lsAddressBook = JSON.parse(localStorage.getItem("__cwd__addressBook"));
        if (accountId in lsAddressBook) {
            delete lsAddressBook[accountId];
            localStorage.setItem("__cwd__addressBook", JSON.stringify(lsAddressBook));
        }
    }


    handleLinkSelector() {
        console.log("TCL: AddressCard -> handleLinkSelector -> handleLinkSelector", "handleLinkSelector")
        let isSelectOpened = this.state.isSelectOpened;

        this.setState({
            isSelectOpened: !isSelectOpened
        })
    }

    render() {
        let { linkData, isMessageModalVisible, isDescriptionEdit, isContactAdded, isDexDisabled, isSelectOpened } = this.state;
        let { currentAccount } = this.props;
        let inspectedAccObj = this.state.inspectedAccount;
        let deviceWidth = window.innerWidth;


        if (inspectedAccObj) {
            let accountId = inspectedAccObj.get("id");
            let accountName = inspectedAccObj.get("name");
            let accountStatus = inspectedAccObj.get("referral_status_type");
            let userContractImg;


            if (accountStatus == 0) {
                userContractImg = <img className="address-card__icon" src={client} />;
            }
            if (accountStatus == 1) {
                userContractImg = <img className="address-card__icon" src={start} />;
            }
            if (accountStatus == 2) {
                userContractImg = <img className="address-card__icon" src={expert} />;
            }
            if (accountStatus == 3) {
                userContractImg = <img className="address-card__icon" src={citizen} />;
            }
            if (accountStatus == 4) {
                userContractImg = <img className="address-card__icon" src={infinity} />;
            }

            let currentAddressBook = JSON.parse(localStorage.getItem("__cwd__addressBook"));
            if (currentAddressBook === null) {
                currentAddressBook = {};
            }

            return (
                <section className="address-card__wrap">
                    <div className="address-card__inner">
                        <div className="address-card__user-block">
                            {userContractImg}
                            <div className="address-card__user-data-wrap">
                                <Link
                                    className="address-card__user-name"
                                    to={`/profile/${accountName}`}
                                >
                                    <span>{accountName}</span>
                                </Link>


                                <div
                                    className="address-card__description-wrap">
                                    {isDescriptionEdit ?
                                        <input
                                            className="address-card__description-input"
                                            type="text"
                                            id={"descriptionInput" + accountId}
                                            maxLength="40"
                                            autoFocus={true}
                                            onChange={this.editDescription.bind(this)}
                                            onBlur={this.handleDescription.bind(this)}
                                        />
                                        :
                                        <span
                                            className="address-card__description-text"
                                            onClick={this.handleDescription.bind(this, "descriptionInput" + accountId)}>
                                            {accountId in currentAddressBook ?
                                                currentAddressBook[accountId].length > 0 ? currentAddressBook[accountId] : counterpart.translate("address_book.account_card.description_placeholder")
                                                :
                                                counterpart.translate("address_book.account_card.description_placeholder")
                                            }
                                        </span>
                                    }

                                    {isDescriptionEdit ? null :
                                        <NewIcon
                                            iconWidth={15}
                                            iconHeight={18}
                                            iconName={"edit_icon"}
                                        />
                                    }

                                </div>
                            </div>
                        </div>

                        {/* BTN BLOCK */}
                        <div className="address-card__btns-block">
                            {/* SHOW DEX */}
                            <button
                                className="address-card__action-btn"
                                type="button"
                                onClick={this.navigateDexItems.bind(this, accountId)}
                                disabled={isDexDisabled}
                            >
                                <NewIcon
                                    iconWidth={18}
                                    iconHeight={22}
                                    iconName={"address-book_dex_icon"}
                                />
                                <Translate content={"address_book.account_card.btns.dex"} />
                            </button>

                            {/* SEND MODAL */}
                            <button
                                className="address-card__action-btn"
                                type="button"
                                onClick={this.showTransfer.bind(this)}
                            >
                                <NewIcon
                                    iconWidth={21}
                                    iconHeight={21}
                                    iconName={"address-book_transfer_icon"}
                                />
                                <Translate content={"address_book.account_card.btns.transfer"} />
                            </button>

                            {/* SEND MESSAGE */}
                            <button
                                className="address-card__action-btn"
                                type="button"
                                onClick={this.showMessageModal.bind(this)}
                            >
                                <NewIcon
                                    iconWidth={21}
                                    iconHeight={21}
                                    iconName={"address-book_message_icon"}
                                />
                                <Translate content={"address_book.account_card.btns.message"} />
                            </button>

                            {/* ADD TO CONTACTS */}
                            {accountId in currentAddressBook ?
                                <button
                                    className="address-card__action-btn address-card__action-btn--remove-contact"
                                    type="button"
                                    onClick={this.removeFromContacts.bind(this, accountId)}
                                >
                                    <NewIcon
                                        iconWidth={16}
                                        iconHeight={21}
                                        iconName={"icon_plus"}
                                    />
                                    <Translate content={"address_book.remove_from_contacts_btn"} />
                                </button>
                                :
                                <button
                                    className="address-card__action-btn"
                                    type="button"
                                    onClick={this.addToContacts.bind(this)}
                                >
                                    <NewIcon
                                        iconWidth={16}
                                        iconHeight={21}
                                        iconName={"icon_plus"}
                                    />
                                    <Translate content={"address_book.account_card.btns.add_tocontacts"} />
                                </button>}

                            {isContactAdded ?
                                <Translate
                                    className="address-card__alert"
                                    content="address_book.account_card.alert.contact_added" />
                                : null}
                        </div>
                    </div>

                    {/* LINK BLOCK */}
                    {deviceWidth > 768 ?
                        <div className="address-card__link-block">
                            {linkData.map(linkItem =>
                                <AccountLink
                                    key={linkItem.text}
                                    link={linkItem.link}
                                    text={linkItem.text}
                                    accountName={accountName}
                                />
                            )}
                        </div>
                        :

                        <ul className="address-card__selector">
                            {isSelectOpened ?
                                linkData.map(linkItem => (
                                    <li
                                        key={linkItem.text}
                                        className="address-card__link-option"
                                    >
                                        <AccountLink
                                            link={linkItem.link}
                                            text={linkItem.text}
                                            accountName={accountName}
                                        />
                                    </li>
                                ))
                                :
                                <li
                                    className="address-card__default-option"
                                    onClick={this.handleLinkSelector.bind(this)}>
                                    <Translate content="address_book.account_card.links.default_text" />
                                </li>
                            }
                            {isSelectOpened ?
                                <li
                                    className="address-card__hide-btn"
                                    onClick={this.handleLinkSelector.bind(this)}
                                >
                                    <NewIcon
                                        iconWidth={13}
                                        iconHeight={10}
                                        iconName={"selector_arrow"}
                                    />
                                    <Translate content="address_book.account_card.links.hide_btn" />
                                </li>
                                : null
                            }
                        </ul>}



                    {/* TRANSFER MODAL */}
                    {currentAccount ?
                        <Transfer
                            id="AddresBookTransfer"
                            refCallback={e => {
                                if (e) this.send_modal = e;
                            }}
                            from_name={currentAccount.get("name")}
                            to_name={accountName}
                            to_name_readonly={true}
                        />
                        : null
                    }


                    {/* MESSAGE MODAL */}
                    {isMessageModalVisible ?
                        <SendMessage
                            toAccountId={accountId}
                            toAccountName={accountName}
                            closeModal={this.closeMessageModal.bind(this)}
                        />
                        : null}
                </section >
            );
        }
        else return null
    }
}

export default AddressCard;