import React from "react";
export class Content extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = Object.create(null);
    }

    render() {
        return(
            <div>
                this is content modules
            </div>
        )
    }
}