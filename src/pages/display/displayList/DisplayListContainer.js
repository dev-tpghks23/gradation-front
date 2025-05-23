import { useOutletContext, useParams } from 'react-router-dom';
import S from './style';

const DisplayListContainer = () => {
  const { category } = useParams()
  const { display, isLoading, isError } = useOutletContext()
  // const id = 1
  // console.log(category)

  if(isLoading) {
    return <S.H6>로딩중!</S.H6>
  }

  if(isError) {
    return <S.H6>작품을 불러오는데 실패했습니다.</S.H6>
  }

  if(!display) {
    return <S.H6>작품이 존재하지 않습니다.</S.H6>
  }

  return (
    <S.Wrapper>
      {display.map((post) => (
        <S.Display key={post.id} to={`/display/${category}/detail/${post.id}`}>
          <S.Overlay className="overlay">
            <S.Content>
              <S.H2>{post.artTitle}</S.H2>
              <S.H4>{post.userName}</S.H4>
            </S.Content>
          </S.Overlay>
          <img src={`${process.env.REACT_APP_BACKEND_URL}/files/api/get/${post.artImgName}?filePath=${post.artImgPath}`} alt={post.artTitle} />
        </S.Display>
      ))}
    </S.Wrapper>
    
  );
};

export default DisplayListContainer;