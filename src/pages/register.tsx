import * as React from "react";
import { Formik, Form } from "formik";
import { Box, Button, Input } from "@chakra-ui/core";
import { Wrapper } from "src/components/Wrapper";
import { InputField } from "src/components/InputField";

interface registerProps{}

const Register: React.FC<registerProps> = ({}) => {
    return (
        <Wrapper>
        <Formik
            initialValues = {{username: "", password: ""}}
            onSubmit={(values)=>{
                console.log(values);
                
            }}
        >
            {({values, isSubmitting}) => (
                <Form>
                    <Input 
                        id="username" 
                        value= { values.username}
                        placeholder="username" />
                        {/* <FormErrorMessage>{form.errors.name}</FormErrorMessage> */}

                        <Box mt={4}>
              <InputField name="email" placeholder="email" label="Email" />
            </Box>
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              register
            </Button>
                </Form>
            )
                
            }

        </Formik>
        </Wrapper>
    )
}

export default Register