import React, { Component } from "react";
import { userLogin } from "react-admin";
import { connect } from "react-redux";
import { MuiThemeProvider } from "@material-ui/core/styles";

class Login extends Component {
    state = {
        username: '',
        password: '',

    }

    setUsername(username){
        this.setState({username})

    }

    setPassword(password){
        this.setState({password})
    }

    submit(e) {
        e.preventDefault();
        this.props.userLogin(this.state)
    }

    render(){
        return(
            <MuiThemeProvider theme={this.props.theme}>
                <form onSubmit={this.submit}>
                    <input name="username" type="username" value={username} onChange={e => this.setUsername(e.target.value)}  />
                    <input name="password" type="password" value={password} onChange={e => this.setPassword(e.target.value)} />
                </form>

            </MuiThemeProvider>
        )
    }
}

export default connect(undefined, { userLogin })(Login);

