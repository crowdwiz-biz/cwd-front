import React from "react";
import Translate from "react-translate-component";
import BeatLoader from "react-spinners/BeatLoader";

class LoadingButton extends React.Component {
    render() {
        return (
            <button
                className={this.props.btnClass}
                onClick={this.props.onClick}
            >
                {this.props.isLoading ? (
                    <BeatLoader
                        color={"#dec27f"}
                        loading={this.props.isLoading}
                        height={4}
                        width={170}
                    />
                ) : (
                    <Translate content={this.props.caption} />
                )}
            </button>
        );
    }
}

export default LoadingButton;
