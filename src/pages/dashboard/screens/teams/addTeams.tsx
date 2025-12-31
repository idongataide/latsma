import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import Images from '@/components/images';
import { FaAngleLeft } from 'react-icons/fa';
import { addTeams } from '@/api/teamsApi';
import { ResponseValue } from '@/interfaces/enums';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
const { Option } = Select;

const AddTeams: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        setLoading(true);
        const data = {
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            phone_number: values.phone,
            role: values.role,
        };
      
        addTeams(data)
            .then((res) => {
                if (res?.error) {
                    toast.error(res.message);
                    return;
                }
                if (res.status === ResponseValue.SUCCESS) {
                    toast.success('Team member added successfully');
                    navigate("/teams"); 
                } else {
                    const errorMsg = res?.response?.data?.msg || 'Failed to add team member';
                    toast.error(errorMsg);
                }
            })
            .catch((error) => {
                toast.error(error.message || "An unexpected error occurred");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <>
            <div className="mb-6 px-6">
                <Toaster/>
                <div className="flex items-center mb-5 mt-10 cursor-pointer"
                    onClick={() => window.history.back()}
                >
                    <FaAngleLeft className='text-lg text-[#667085]' />
                    <p className='ml-2 font-bold text-[#667085] text-lg'>Back</p>
                </div>
            
                <div className="min-h-screen w-full mx-auto max-w-[480px] flex flex-col items-center justify-start">
                    {/* Top Banner */}
                    <div className="mb-3 rounded-2xl overflow-hidden">         
                        <img
                            src={Images.teambg}
                            alt="Team"
                            className="w-[100%]"
                        />
                    </div>

                    {/* Form */}
                    <div className="bg-white w-full rounded-2xl border border-[#E5E9F0] px-8 py-8">
                        <h2 className="text-[#667085] text-xl font-medium mb-6">Add Team members</h2>
                        <Form 
                            form={form}
                            layout="vertical" 
                            onFinish={onFinish}
                        >
                            <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'Enter first name' }]}>
                                <Input placeholder="Enter first name" />
                            </Form.Item>
                            <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: 'Enter last name' }]}>
                                <Input placeholder="Enter last name" />
                            </Form.Item>
                            <Form.Item label="Phone number" name="phone" rules={[{ required: true, message: 'Enter phone number' }]}>
                                <Input
                                    addonBefore={
                                        <span className="flex items-center">
                                            <img src="https://flagcdn.com/ng.svg" alt="NG" style={{ width: 20, marginRight: 4 }} />NG
                                        </span>
                                    }
                                    placeholder="+234"
                                />
                            </Form.Item>
                            <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Select role' }]}>
                                <Select placeholder="Select" className='!h-[46px]'>
                                    <Option value="superadmin">Super Admin</Option>
                                    <Option value="admin">Admin</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item label="Email address" name="email" rules={[{ required: true, message: 'Enter email address' }]}>
                                <Input placeholder="johndoe@xyz.com" />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="h-[46px]! px-10! mt-5! rounded-lg bg-[#FF6C2D] text-white font-medium text-lg hover:bg-[#E55B1F] transition border-0"
                                >
                                    Send Invite
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddTeams;
