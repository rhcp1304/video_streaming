import React from "react";

import Container from "react-bootstrap/cjs/Container";
import Row from "react-bootstrap/cjs/Row";
import Col from "react-bootstrap/cjs/Col";
import Button from "react-bootstrap/cjs/Button";
import Form from "react-bootstrap/cjs/Form";
import InputGroupWithExtras from "react-bootstrap/cjs/InputGroup";

import 'bootstrap/dist/css/bootstrap.min.css';
import VideoPlayer from "./VideoPlayer";
import ChatRoom from "./ChatRoom";
import DatabaseBackend from "./DatabaseBackend";
import URLFormatter from "./URLFormatter";
import JitsiMeet from "./JitsiMeet"; // Import the new JitsiMeet component

class PartyRoom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'room_id': props.room_id || "NO ROOM ID PROVIDED",
            'title': props.title || "GDrive Party!",
            'url': props.url,
            'database': new DatabaseBackend(),
            'ref': "",
            'is_join': props.is_join || false,
            'name': props.name,
            'add_url': '',
            'play_mode': 'pause',
            'url_formatter': new URLFormatter(),
        };

        console.log(`IS JOIN ${this.state.is_join}`);
    }

    componentDidMount() {
        if (!this.state.is_join) {
            this.state.database.createRoom({
                "url": this.state.url,
                "host": this.state.name,
                "time": 0,
                "mode": 'pause',
                "chats": [],
                "video_list": [],
                "suggestions": [],
            }).then((ref) => {
                this.setState({"room_id": ref.id});
                console.log(`Created room: ${ref.id}`);
            });
        } else {
            this.state.database.getRef(this.state.room_id).then((ref) => {
                ref.get().then((doc) => {
                    if (doc.exists) {
                        let data = doc.data();
                        this.setState({
                            'url': data['url'],
                            'title': data['title'] || "GDrive Party!",
                            'play_mode': data['mode'],
                        });
                        console.log("Document data:", data);
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                        // Handle room not found, e.g., redirect to landing page
                        alert("Room not found!");
                        window.location.href = '/'; // Redirect to home
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                    alert("Error joining room. Please try again.");
                    window.location.href = '/'; // Redirect to home on error
                });
            });
        }

        setTimeout(() => {
            this.state.database.state.ref.onSnapshot(doc => {
                let data = doc.data();
                if (data != undefined) {
                    this.setState({
                        "url": data['url'],
                        "play_mode": data['mode'],
                    });
                }
            });
        }, 2000);
    }

    async addVideo(url) {
        await this.state.database.addVideo(url);
    }

    async deleteRoom() {
        await this.state.database.deleteRoom();
        alert("Room Deleted!");
        window.location.href = '/'; // Redirect to home
    }

    render() {
        let room_controls = "";
        if (!this.state.is_join) { // Only host can see these controls
            room_controls = (
                <div>
                    <Row className={"justify-content-md-center"}>
                        <Col md={'auto'}>
                            <Button variant={"danger"} onClick={() => this.deleteRoom()}>Delete Room</Button>
                        </Col>
                        <Col md={'auto'}>
                            <Form>
                                <Form.Group controlId="landingForm.ControlInput1">
                                    <Form.Control onChange={(evt) => this.state.add_url = evt.target.value}
                                                  placeholder="Add Video URL (GDrive, YT, etc.)"/>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col md={'auto'}>
                            <Button variant={"info"}
                                    onClick={() => this.addVideo(this.state.url_formatter.rewrite_url(this.state.add_url))}
                            >Add Video</Button>
                        </Col>
                    </Row>
                </div>
            );
        }

        // Adjust column sizes to fit Jitsi
        return (
            <div>
                <Container fluid>
                    <br/>
                    <Row className={"justify-content-md-center"}>
                        <h1>{this.state.title}</h1>
                    </Row>
                    <Row>
                        <Col>
                            Room-ID: {this.state.room_id}
                        </Col>
                        <Col>
                            {this.state.play_mode.toUpperCase()}
                        </Col>
                    </Row>
                    <Row>
                        {/* Video Player takes up more space */}
                        <Col md={7}> {/* Increased from md='auto' */}
                            <VideoPlayer url={this.state.url} database={this.state.database} is_join={this.state.is_join}/>
                        </Col>
                        {/* Chat and Jitsi side-by-side in a smaller column area */}
                        <Col md={5}> {/* This column now holds both Chat and Jitsi */}
                            <Row> {/* Inner row for Chat and Jitsi */}
                                <Col md={12}> {/* Chat takes full width of this column */}
                                    <ChatRoom name={this.state.name} database={this.state.database}/>
                                </Col>
                                <Col md={12}> {/* Jitsi takes full width of this column */}
                                    {/* Only render Jitsi if room_id is available */}
                                    {this.state.room_id && (
                                        <JitsiMeet room_id={this.state.room_id} name={this.state.name}/>
                                    )}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <br/>
                    {room_controls}
                </Container>
            </div>
        );
    }
}

export default PartyRoom;