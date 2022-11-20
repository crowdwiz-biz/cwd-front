import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../../NewIcon/NewIcon";
import ls from "common/localStorage";

let ss = new ls("__graphene__");

class ReferralInfo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showClipboardMsg: false
        };
    }

    async selectValue(ref) {
        try {
            await navigator.clipboard.writeText(ref);
            this.setState({["showClipboardMsg"]: true});
            setTimeout(() => {
                this.setState({["showClipboardMsg"]: false});
            }, 2000);
        } catch (err) {
            console.log(err, "text is not copied to clipboard");
        }
    }

    render() {
        let apiUrl = ss.get("serviceApi");
        let account_name = this.props.currentAccount;

        return (
            <div className="ref-info">
                <Translate
                    className="ref-info__text-block"
                    content="gamezone.matrix.ref_text"
                />
                <div
                    className="ref-info__link-block"
                    onClick={() =>
                        this.selectValue(apiUrl + `/?r=${account_name}`)
                    }
                >
                    <div className="ref-info__link-text">
                        {apiUrl + `/?r=${account_name}`}
                    </div>
                    <span className="ref-info__btn">
                        <NewIcon
                            iconClass={"ref-info__btn-img"}
                            iconWidth={16}
                            iconHeight={16}
                            iconName={"matrix_icon_copy"}
                        />
                    </span>

                    {this.state.showClipboardMsg ? (
                        <div className="ref-info__msg">
                            <Translate content="actions.alerts.copy_text" />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}
export default ReferralInfo;
