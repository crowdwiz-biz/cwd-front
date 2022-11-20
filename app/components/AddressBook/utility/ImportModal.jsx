import React from "react";
import Translate from "react-translate-component";
import counterpart from "counterpart";


class ImportModal extends React.Component {
    constructor(props) {
        super(props);
    }

    importAddressBook() {
        let importModalField = document.getElementById("importModalField").value;

        fetch(importModalField)
        .then(response => response.json())
        .then(data => {
            localStorage.setItem("__cwd__addressBook", JSON.stringify(data));
        })

        this.props.handleImportModal();
    }

    render() {
        return (
            <div className="address-modal__overlay">
                <div className="address-modal">
                    <input
                        className="address-modal__input cwd-common__input"
                        type="text"
                        placeholder={counterpart.translate("address_book.contacs_list.import_placeholder")}
                        id="importModalField"
                    />

                    <div className="address-modal__btn-wrap">
                        <button
                            className="cwd-btn__action-btn address-modal__action-btn"
                            type="button"
                            onClick={this.props.handleImportModal}
                        >
                            <Translate content="address_book.contacs_list.canсel_btn" />
                        </button>

                        <button
                            className="cwd-btn__action-btn address-modal__action-btn address-modal__action-btn--confirm"
                            type="button"
                            onClick={this.importAddressBook.bind(this)}
                        >
                            <Translate content="address_book.contacs_list.import_btn" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ImportModal;