import React from "react";
import PropTypes from "prop-types";
import Translate from "react-translate-component";
import BarLoader from "react-spinners/BarLoader";

// IMAGES
import cwdLogo from "assets/svg-images/svg-common/main-page/header/cwd_logo.svg";

class LoadingIndicator extends React.Component {
    static propTypes = {
        type: PropTypes.string,
        loadingText: PropTypes.string
    };

    static defaultProps = {
        type: null,
        loadingText: null
    };

    constructor(props) {
        super(props);
    }

    render() {
        let loading = this.props.loading;

        return (
            <div className="loading-panel__overlay">
                <div className="loading-panel">
                    <img
                        src={cwdLogo}
                        className="loading-panel__logo"
                        alt="cwd"
                    />

                    <div className="loading-panel__inicator-wrap">
                        <BarLoader
                            color={"#dec27f"}
                            loading={loading}
                            height={4}
                            width={150}
                        />
                    </div>

                    <Translate
                        className="loading-panel__title"
                        content="app_init.loading_text"
                    />

                    {this.props.loadingText && (
                        <span className="loading-panel__text">
                            {this.props.loadingText}
                        </span>
                    )}
                </div>
            </div>
        );
    }
}

export default LoadingIndicator;
