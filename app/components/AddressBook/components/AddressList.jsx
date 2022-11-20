import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import AddressCard from "./AddressCard";
import ImportModal from "../utility/ImportModal";
import ls from "common/localStorage";


class AddressList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            exportLink: "",
            copyExportLink: false,
            showImportModal: false,
            exportLink: ""
        }
    }

    exportAddressBook() {
        let addressData = localStorage.getItem("__cwd__addressBook");

        let ss = new ls("__graphene__");
        let apiUrl = ss.get("serviceApi");

        let fetchUrl = apiUrl + "/upload_address_book";

        fetch(fetchUrl, {
            method: "POST",
            body: addressData
        })
            .then(response => response.text())
            .then(data => {
                this.setState({
                    exportLink: apiUrl + "/ipfs/" + data,
                    copyExportLink: true
                });

                let copyText = this.state.exportLink;
                navigator.clipboard.writeText(copyText);

                // SHOW ALERT
                this.setState({
                    copyExportLink: true,
                    copyText: copyText
                });

                this.timer = setTimeout(() => {
                    this.setState({ copyExportLink: false });
                }, 2000);
            })
            .catch(error => console.log(error));
    }

    handleImportModal() {
        let showImportModal = this.state.showImportModal;

        this.setState({
            showImportModal: !showImportModal
        })
    }

    render() {
        let { currentAccount, history } = this.props;
        let { copyExportLink, showImportModal } = this.state;

        let currentAddressBook = JSON.parse(localStorage.getItem("__cwd__addressBook"));
        if (currentAddressBook === null) {
            currentAddressBook = {};
        }

        return (
            <section className="address-list__wrap">
                <div className="address-list__header">
                    <Translate
                        className="cwd-common__subtitle"
                        content="address_book.contacs_list.subtitle"
                    />


                    <div className="address-list__btn-block-wrap">
                        {Object.keys(currentAddressBook).length > 0 ?
                            <button
                                className="cwd-btn__action-btn address-list__action-btn"
                                type="button"
                                onClick={this.exportAddressBook.bind(this)}
                            >
                                <Translate content="address_book.contacs_list.export_btn" />

                                <NewIcon
                                    iconWidth={16}
                                    iconHeight={16}
                                    iconName={"export_icon"}
                                />

                                {copyExportLink ?
                                    <Translate
                                        className="address-list__alert"
                                        content="address_book.contacs_list.link_copied" />
                                    : null}
                            </button>
                            : null}

                        <button
                            className="cwd-btn__action-btn address-list__action-btn"
                            type="button"
                            onClick={this.handleImportModal.bind(this)}
                        >
                            <Translate content="address_book.contacs_list.import_btn" />

                            <NewIcon
                                iconWidth={16}
                                iconHeight={16}
                                iconName={"import_icon"}
                            />
                        </button>
                    </div>


                    {/* IMPORT MODAL */}
                    {showImportModal ?
                        <ImportModal
                            handleImportModal={this.handleImportModal.bind(this)} />
                        : null}
                </div>

                {/* CONTACTS LIST */}
                <div className="address-list__container">
                    {Object.keys(currentAddressBook).length > 0 ?
                        Object.keys(currentAddressBook).map(contact =>
                            <AddressCard
                                key={contact}
                                inspectedAccId={contact}
                                currentAccount={currentAccount}
                                history={history}
                            />)
                        :
                        <Translate content="address_book.contacs_list.empty_contacts_list" />
                    }
                </div>
            </section>
        );
    }
}

export default AddressList;