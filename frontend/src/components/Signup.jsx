import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Alert,
    Spinner,
} from 'reactstrap';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [error, setError] = useState('');
    const [role, setRole] = useState('user'); // default to 'user'

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('role', role);
        formData.append('password', password);
        if (profilePic) {
            formData.append('profilePic', profilePic);
        }
        console.log('FormData contents:', {
            role,
            name,
            email,
            password,
            hasProfilePic: !!profilePic,
        });

        try {
            const response = await axios.post('http://localhost:5000/api/auth/signup', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const { token } = response.data;
            if (token) {
                localStorage.setItem('token', token);
                alert('Signup successful! Redirecting to login.');
                navigate('/login');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.msg ||
                err.response?.data?.errors?.join(', ') ||
                'Something went wrong';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="min-vh-100 d-flex justify-content-center align-items-center">
            <Row className="w-100">
                <Col md="6" lg="4" className="mx-auto">
                    <Card className="shadow-sm border-0 p-4">
                        <CardBody>
                            <h3 className="text-center mb-4">Sign Up</h3>

                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label for="name">Name</Label>
                                    <Input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label for="email">Email</Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label for="role">Role</Label>
                                    <Input
                                        type="select"
                                        id="role"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        required
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </Input>
                                </FormGroup>

                                <FormGroup>
                                    <Label for="password">Password</Label>
                                    <Input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label for="profilePic">Profile Picture</Label>
                                    <Input
                                        type="file"
                                        id="profilePic"
                                        onChange={(e) => setProfilePic(e.target.files[0])}
                                        accept="image/*"
                                    />
                                </FormGroup>

                                {error && <Alert color="danger">{error}</Alert>}

                                <Button color="primary" block type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" /> Signing Up...
                                        </>
                                    ) : (
                                        'Sign Up'
                                    )}
                                </Button>
                            </Form>

                            <p className="text-center mt-3 mb-0">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary">
                                    Log in
                                </Link>
                            </p>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Signup;