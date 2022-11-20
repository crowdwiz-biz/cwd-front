import React from "react";
import counterpart from "counterpart";
import ClipboardButton from "react-clipboard.js";
import NewIcon from "../NewIcon/NewIcon";
import {Tooltip} from "crowdwiz-ui-modal";

const CopyButton = ({
    className = "button ",
    text = "",
    tip = "tooltip.copy_tip",
    dataPlace = "right",
    buttonIcon = "copy2",
    buttonText = ""
}) => {
    return (
        <Tooltip placement={dataPlace} title={counterpart.translate(tip)}>
            <div>
                <ClipboardButton
                    data-clipboard-text={text}
                    className={className}
                >
                    {!buttonText ? (
                        <NewIcon
                            iconWidth={20}
                            iconHeight={20}
                            iconName={buttonIcon}
                        />
                    ) : (
                        buttonText
                    )}
                </ClipboardButton>
            </div>
        </Tooltip>
    );
};

export default CopyButton;
