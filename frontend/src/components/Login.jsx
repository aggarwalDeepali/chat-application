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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        alert('Login successful! Redirecting...');
        navigate('/dashboard'); // Redirect to a dashboard or main page
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.msg ||
        err.response?.data?.errors?.join(', ') ||
        'Invalid email or password';
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
              <h3 className="text-center mb-4">Log In</h3>

              <Form onSubmit={handleSubmit}>
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
                  <Label for="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FormGroup>

                {error && <Alert color="danger">{error}</Alert>}

                <Button color="primary" block type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner size="sm" /> Logging in...
                    </>
                  ) : (
                    'Log In'
                  )}
                </Button>
              </Form>

              <p className="text-center mt-3 mb-0">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary">
                  Sign up
                </Link>
              </p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
