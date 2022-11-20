import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import ls from "common/localStorage";

let ss = new ls("__graphene__");

class RefLinkBlock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showClipboardAlert: false
        };
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    copyRefLink(value, e) {
        this.setState({
            showClipboardAlert: true
        });

        this.timer = setTimeout(() => {
            this.setState({ showClipboardAlert: false });
        }, 2000);

        navigator.clipboard.writeText(value);
    }

    render() {
        let apiUrl = ss.get("serviceApi");
        let accountName = this.props.accountName;

        return (
            <div className="ref-link-block__wrap">
                <Translate
                    className="ref-link-block__label"
                    content="user_profile.ref_link" />

                <div className="ref-link-block__inner">
                    <span className="ref-link-block__value">{apiUrl + `/?r=${accountName}`}</span>

                    <span
                        className="ref-link-block__copy-btn"
                        onClick={this.copyRefLink.bind(this, apiUrl + `/?r=${accountName}`)}>
                        <NewIcon
                            iconWidth={20}
                            iconHeight={20}
                            iconName={"icon_copy"}
                        />
                    </span>
                    {this.state.showClipboardAlert ? (
                        <Translate
                            className="ref-link-block__alert"
                            content="actions.alerts.copy_text" />
                    ) : null}
                </div>
            </div>
        );
    }
}

export default RefLinkBlock;