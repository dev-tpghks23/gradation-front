import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import * as S from './style';

const AdminContainer = () => {

  const location = useLocation()
  const path = location.pathname;
  console.log(path)
  let title = '';
  if (path.includes('faq')) {
    title = '자주 묻는 질문';
  } else if (path.includes('qna')) {
    title = '1:1 문의';
  } else if (path.includes('form-management')) {
    title = '양식 관리';
  } else {
    title = '회원 관리';
  }

  let subTitle = '';
  if (path.includes('modify')) {
    subTitle = '수정';
  } else if (path.includes('registration')) {
    subTitle = '등록';
  } else if (path.includes('detail')) {
    subTitle = '상세';
  } else if (path.includes('answer')) {
    subTitle = '답변';
  }
  
  return (
    <>
      <S.AdminPageTitle>관리자 / {title} {subTitle}</S.AdminPageTitle>
      <Outlet />
    </>
  );
};

export default AdminContainer;