import { useState } from 'react';
import S from './style';
import { useForm } from 'react-hook-form';
import CheckedButton from '../../../../components/button/CheckedButton';
import UncheckedButton from '../../../../components/button/UncheckedButton';
import JoinCompleteModal from '../joinModal/JoinCompleteModal';
import InfoAlert from '../../../display/alert/infoAlert/InfoAlert';

const NormalJoin = () => {
  
  const { register, handleSubmit, getValues, trigger, formState: {isSubmitting, errors, isValid} } = useForm({mode: "onBlur"});

  const identificationRegex = /^(?=.*[a-z])(?=.*\d)[a-z\d]{6,20}$/;
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#])[a-zA-Z\d!@#]{8,12}$/;
  const phoneRegex = /^01[016789][0-9]{7,8}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const [agreement, setAgreement] = useState([false, false, false, false]);
  const isAllAgreed = agreement[0] && agreement[1] && agreement[2] && agreement[3] // 전체 동의
  const isAllRequiredAgreed = agreement[0] && agreement[1] && agreement[2] // 필수 동의 3개
  
  const [userIdentification, setUserIdentification] = useState(""); 
  const [userEmail, setUserEmail] = useState(""); 
  const [code, setCode] = useState("") 

  const [idCheckMessage, setIdCheckMessage] = useState("") // 아이디 중복 체크 결과 
  const [isIdAvailable, setIsIdAvailable] = useState(null) // 아이디 사용 가능 여부
  const [emailCheckMessage, setEmailCheckMessage] = useState("") // 이메일 중복 체크 결과 
  const [isSendVerificationCode, setIsSendVerificationCode] = useState(false) // 인증번호 이메일 전송 성공 여부
  const [confirmVerificationCode, setConfirmVerificationCode] = useState(false) // 인증번호 검증 성공 여부
  const [verificationMessage, setVerificationMessage] = useState("") // 인증 실패 성공 결과
  const [errorCount, setErrorCount] = useState(1); // 인증번호 실패 횟수
  const [isEmailButtonClicked, setIsEmailButtonClicked] = useState(false); // 이메일 인증 버튼 클릭 여부

  const[passwordType, setPasswordType] = useState({type : 'password', visible : false});
  const[passwordConfirmType, setPasswordConfirmType] = useState({type : 'password', visible : false});

  const[isModalOpen, setIsModalOpen] = useState(false)

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const isJoin = isValid && isAllRequiredAgreed && isIdAvailable === true && confirmVerificationCode === true

  const handlePasswordType = () => {
    setPasswordType(() => {
      if(!passwordType.visible) {
        return {type : 'text', visible : true}
      }
      return {type : 'password', visible : false}
    })
  }
    
  const handlePasswordConfirmType = () => {
    setPasswordConfirmType(() => {
      if(!passwordConfirmType.visible) {
        return {type : 'text', visible : true};
      }
      return {type : 'password', visible : false}
    })
  }
  
  // 전체 약관 동의
  const agreementAll = () => {
    const shouldCheckAll = !isAllAgreed;
    setAgreement([shouldCheckAll, shouldCheckAll, shouldCheckAll, shouldCheckAll])
  }
  
  // 개별 약관 동의
  const agreementOne = (i) => {
    const newAgreement = [...agreement];
    newAgreement[i] = !newAgreement[i];
    setAgreement(newAgreement)
  }
  
  const agreementList = [
    "만 14세 이상입니다.",
    "[필수] 서비스 약관 동의",
    "[필수] 개인정보 수집 및 이용 동의",
    "[선택] 개인정보 수집 및 이용 동의",
  ];
  
  // 아이디 중복 체크
  const checkId = async () => {
    // console.log("userIdentification", userIdentification)
    
    if(!userIdentification) {
      // alert("아이디를 입력하세요.")
      setAlertMessage("아이디를 입력하세요.")
      setShowAlert(true)
      return;
    }
    
    await fetch(`http://localhost:10000/users/api/check-id/${userIdentification}`, {
      method : "GET"
    })
    .then((res) => {
      if(!res.ok) {
        return res.json().then((res) => {
          setIdCheckMessage(res.message)
          setIsIdAvailable(false)
        })
      }
      return res.json()
    })
    .then((res) => {
      // console.log(res)
      setIdCheckMessage(res.message)
      setIsIdAvailable(true)
    })
    .catch(console.error)
  }
  
  // 이메일 중복 체크 + 이메일 인증번호 전송
  const getVerificationCodeEmail = async () => {
    if(!userEmail) {
      // alert("이메일을 입력하세요.")
      setAlertMessage("이메일을 입력하세요.")
      setShowAlert(true)
      return;
    }

    // 이메일 중복 체크
    await fetch(`http://localhost:10000/users/api/check-email/${userEmail}`, {
      method : "GET"
    })
    .then((res) => {
      if(!res.ok) {
        // 이미 사용중인 이메일
        res.json().then((res) => {
          setEmailCheckMessage(res.message)
          // throw new Error("이미 사용중인 이메일입니다.")
        })
      }
      return res.json();
    })
    .then(() => {
      setEmailCheckMessage("");
      setIsSendVerificationCode(true)
      setIsEmailButtonClicked(true)
      setErrorCount(0);
      setConfirmVerificationCode(false);
      
      // 인증번호 발송
      fetch("http://localhost:10000/auth/sendEmail", {
        method : "POST",
        headers : {
          "Content-Type" : "application/json"
        },
        body : JSON.stringify(userEmail)
      })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch(console.error)
    })
    
    .catch(console.error)
  }
  
  // 인증번호 검증
  const getIsVerificationCode = async () => {
    if(!code) {
      setAlertMessage("인증번호를 입력하세요.")
      setShowAlert(true)
      setVerificationMessage("필수 항목입니다.")
      return;
    }

      await fetch("http://localhost:10000/auth/verifyCode", {
        method : "POST",
        headers : {
          "Content-Type" : "application/json"
        },
        body : JSON.stringify(code)
      })
      .then((res) => res.json())
      .then((res) => {
        // console.log(res)
        if(!res.isFlag) {
          const updateErrorCount = errorCount + 1;
          if(updateErrorCount >= 3) {
            setVerificationMessage(`인증코드 ${updateErrorCount}회 실패! \n다시 인증해주세요.`)
            setErrorCount(0)
            setConfirmVerificationCode(false)
            setIsEmailButtonClicked(false)
            setCode("")
            return;
          }
          setErrorCount(updateErrorCount)
          setVerificationMessage(`인증코드가 일치하지 않습니다. (${updateErrorCount}회)`)
          return;
        }
        setConfirmVerificationCode(true);
        setVerificationMessage("인증이 완료되었습니다.")
      })
      .catch(console.error)
    }
    // console.log("confirmVerificationCode", confirmVerificationCode)
    
    return (
    <div>
      <form autoComplete="off" onSubmit={handleSubmit(async (data) => {

        // 아이디 중복 체크
        if(!isIdAvailable) {
          // alert("아이디 중복 체크 필수입니다.")
          setAlertMessage("아이디 중복 체크 필수입니다.")
          setShowAlert(true)
          return;
        }
        
        // 이메일 인증
        if(!isSendVerificationCode) {
          // alert("이메일 인증을 진행해주세요.")
          setAlertMessage("이메일 인증을 진행해주세요.")
          setShowAlert(true)
          return;
        }
        
        // 인증번호 확인
        if(!confirmVerificationCode) {
          // alert("인증번호 확인은 필수입니다.")
          setAlertMessage("인증번호 확인은 필수입니다.")
          setShowAlert(true)
          return;
        }
        
        // 필수 약관 동의
        if(!isAllRequiredAgreed) {
          // alert("필수 약관에 동의해주세요.")
          setAlertMessage("필수 약관에 동의해주세요.")
          setShowAlert(true)
          return;
        }
          
        const {
          userIdentification,
          userPassword,
          passwordConfirm,
          userName,
          userNickName,
          userPhone,
          userEmail,
        } = data;
          
        const userVO = {
          userIdentification : userIdentification,
          userPassword : userPassword,
          passwordConfirm : passwordConfirm,
          userName : userName,
          userNickName : userNickName,
          userPhone : userPhone,
          userEmail : userEmail,
        }
          
        // 회원가입
        await fetch("http://localhost:10000/users/api/join/normal", {
          method : "POST",
          headers : {
            "Content-Type" : "application/json"
          },
          body : JSON.stringify(userVO)
        })
        .then((res) => {
          if(!res.ok) {
            return res.json().then((res) => {
              // console.log(res)
              // alert(`${res.message}`)
            })
          }
          return res.json()
        })
        .then((res) => {
          // console.log(res)
          // alert(res.message)
          setIsModalOpen(true)
          // navigate("/login")
        })
        .catch(console.error)
        })}>
          
        <S.Container>
          <S.Wrapper>
            <S.H2>회원가입</S.H2>
              <S.InputContainer>
                <S.BorderWrapper>
                  <S.Border>
                    <S.InputWrapper>
                      <S.Label>
                        <S.H7>아이디<span>*</span></S.H7>
                        <S.Input type='text' placeholder='6~20자 영문, 숫자 조합으로 입력하세요.'
                        {...register("userIdentification", {
                          required : true,
                          pattern : {
                            value : identificationRegex
                          },
                          onChange : (e) => {
                            setUserIdentification(e.target.value)
                            setIsIdAvailable(null);
                            setIdCheckMessage("")
                          }
                        })}
                      />
                      </S.Label>
                      <S.ButtonWrapper>
                        {isIdAvailable ? (
                          <CheckedButton type="button">중복 체크 완료</CheckedButton>
                        ) : (
                          <UncheckedButton type="button"
                          disabled={errors && errors?.userIdentification?.type === "pattern"}
                          onClick={checkId}
                          >중복 체크</UncheckedButton>
                        )}
                        </S.ButtonWrapper>
                    </S.InputWrapper>
                  </S.Border>
                  {errors && errors?.userIdentification?.type === "required" && (
                    <S.Warning>필수 항목입니다.</S.Warning>
                    )}
                  {errors && errors?.userIdentification?.type === "pattern" && (
                    <S.Error>소문자, 특수문자를 각 하나 포함한 6~20자리여야 합니다.</S.Error>
                  )}
                  {idCheckMessage && (
                    <S.Error>{idCheckMessage}</S.Error>
                  )}
                </S.BorderWrapper>
      
                <S.BorderWrapper>
                  <S.Border>
                    <S.InputWrapper>
                      <S.Label>
                        <S.H7>비밀번호<span>*</span></S.H7>
                        <S.Input type={passwordType.type} placeholder='8~12자 영문, 숫자, 특수문자 조합으로 입력하세요.' autoComplete="off"
                        {...register("userPassword", {
                          required : true,
                          pattern : {
                            value : passwordRegex,
                          },
                          onChange : (e) => {
                            const confirm = getValues("passwordConfirm");
                            if (confirm) {
                              trigger("passwordConfirm");
                            }
                          }
                        })}
                      />
                      </S.Label>
                      <S.Icon onClick={handlePasswordType}
                        src={passwordType.visible ? "/assets/images/icon/open-eye.png" : "assets/images/icon/close-eye.png"}/>
                    </S.InputWrapper>
                  </S.Border>
                  {errors && errors?.userPassword?.type === "required" && (
                    <S.Warning>필수 항목입니다.</S.Warning>
                    )}
                  {errors && errors?.userPassword?.type === "pattern" && (
                    <S.Error>소문자, 숫자, 특수문자를 각 하나 포함한 8~12자여야 합니다.</S.Error>
                  )}
                </S.BorderWrapper>

                <S.BorderWrapper>
                  <S.Border>
                    <S.InputWrapper>
                      <S.Label>
                        <S.H7>비밀번호 확인<span>*</span></S.H7>
                        <S.Input type={passwordConfirmType.type} placeholder='8~12자 영문, 숫자, 특수문자 조합으로 입력하세요.' autoComplete="off"
                        {...register("passwordConfirm", {
                          // required : true,
                          required : "필수 항목입니다.",
                          pattern : {
                            value : passwordRegex,
                            message: "8~12자 영문, 숫자, 특수문자 조합으로 입력하세요."
                          },
                          validate : {
                            matchPassword : (passwordConfirm) => {
                              const userPassword = getValues("userPassword");
                              if(!userPassword) {
                                return true;
                              }
                              if(passwordConfirm !== userPassword) {
                                return "비밀번호가 일치하지 않습니다."
                              }
                              return true;
                            }
                          }
                        })}
                      />
                      </S.Label>
                      <S.Icon onClick={handlePasswordConfirmType}
                        src={passwordConfirmType.visible ? "/assets/images/icon/open-eye.png" : "assets/images/icon/close-eye.png"}/>
                    </S.InputWrapper>
                  </S.Border>
                  {errors && errors?.passwordConfirm?.message === "필수 항목입니다." && (
                    <S.Warning>필수 항목입니다.</S.Warning>
                  )}
                  {errors && errors?.passwordConfirm?.message === "8~12자 영문, 숫자, 특수문자 조합으로 입력하세요." && (
                    <S.Error>8~12자 영문, 숫자, 특수문자 조합으로 입력하세요.</S.Error>
                  )}
                  {errors && errors?.passwordConfirm?.message === "비밀번호가 일치하지 않습니다." && (
                    <S.Error>비밀번호가 일치하지 않습니다.</S.Error>
                  )}
                </S.BorderWrapper>

                <S.BorderWrapper>
                  <S.Border>
                    <S.InputWrapper>
                      <S.Label>
                        <S.H7>이름<span>*</span></S.H7>
                        <S.Input type='text' placeholder='이름을 입력하세요.'
                        {...register("userName", {
                          required : true,
                        })}
                        />
                      </S.Label>
                      <S.ButtonWrapper>
                      </S.ButtonWrapper>
                    </S.InputWrapper>
                  </S.Border>
                  {errors && errors?.userName?.type === "required" && (
                    <S.Warning>필수 항목입니다.</S.Warning>
                  )}
                  </S.BorderWrapper>
                  <S.BorderWrapper>
                    <S.Border>
                      <S.InputWrapper>
                        <S.Label>
                          <S.H7>닉네임</S.H7>
                          <S.Input type='text' placeholder='닉네임을 입력하세요.'
                          {...register("userNickName")}
                          />
                        </S.Label>
                      </S.InputWrapper>
                    </S.Border>
                  </S.BorderWrapper>

                  <S.BorderWrapper>
                    <S.Border>
                      <S.InputWrapper>
                        <S.Label>
                          <S.H7>휴대폰<span>*</span></S.H7>
                          <S.Input type='text' placeholder='휴대폰 번호를 입력하세요.'
                          {...register("userPhone", {
                            required : true,
                            pattern : {
                            value : phoneRegex,
                            }
                          })}
                        />
                        </S.Label>
                      </S.InputWrapper>
                    </S.Border>
                    {errors && errors?.userPhone?.type === "required" && (
                      <S.Warning>필수 항목입니다.</S.Warning>
                    )}
                    {errors && errors?.userPhone?.type === "pattern" && (
                      <S.Error>휴대폰 번호 양식에 맞게 입력해주세요.</S.Error>
                    )}
                  </S.BorderWrapper>

                  <S.BorderWrapper>
                    <S.Border>
                      <S.InputWrapper>
                        <S.Label>
                          <S.H7>이메일<span>*</span></S.H7>
                          <S.Input type='text' placeholder='이메일을 입력하세요.'
                          {...register("userEmail", {
                            required : true,
                            pattern : {
                              value : emailRegex
                            }, 
                            onChange : (e) => {
                              setUserEmail(e.target.value)
                              setConfirmVerificationCode(false)
                              setIsEmailButtonClicked(false)
                              setErrorCount(0)
                              setEmailCheckMessage("");
                              setVerificationMessage("")
                              setCode("")
                            }
                          })}
                        />
                        </S.Label>
                        <S.ButtonWrapper>
                          {isEmailButtonClicked ? (
                            <CheckedButton type="button" onClick={getVerificationCodeEmail}>이메일 재전송</CheckedButton>
                          ) : (
                            <UncheckedButton type="button" 
                            disabled={errors && errors?.userEmail?.type === "pattern"}
                            onClick={getVerificationCodeEmail}>이메일 인증</UncheckedButton>
                          )}
                        </S.ButtonWrapper>
                      </S.InputWrapper>
                    </S.Border>
                    {errors && errors?.userEmail?.type === "required" && (
                      <S.Warning>필수 항목입니다.</S.Warning>
                    )}
                    {errors && errors?.userEmail?.type === "pattern" && (
                      <S.Error>이메일 양식에 맞게 입력해주세요.</S.Error>
                    )}
                    {emailCheckMessage && (
                      <S.Error>{emailCheckMessage}</S.Error>
                    )}
                    {isSendVerificationCode && !errors.userEmail && (
                      <S.Error>인증코드가 발송되었습니다.</S.Error>
                    )}
                  </S.BorderWrapper>

                  <S.HiddenBorderWrapper $visible={isSendVerificationCode}>
                    {isSendVerificationCode && (
                      <S.Border>
                        <S.InputWrapper>
                          <S.Label>
                            <S.H7>인증번호<span>*</span></S.H7>
                            <S.Input placeholder='인증번호를 입력하세요.'
                              onChange = {(e) => setCode(e.target.value)}
                              value={code}
                            />
                          </S.Label>
                          <S.ButtonWrapper>
                            {confirmVerificationCode ? (
                              <CheckedButton type="button">인증 완료</CheckedButton>
                            ): (
                              <UncheckedButton onClick={getIsVerificationCode} type="button">인증번호 확인</UncheckedButton>
                            )}
                          </S.ButtonWrapper>
                        </S.InputWrapper>
                      </S.Border>
                    )}
                    {verificationMessage && (
                      verificationMessage === "필수 항목입니다." ? (
                        <S.Warning>{verificationMessage}</S.Warning>
                      ) : (
                        <S.Error>{verificationMessage}</S.Error>
                      )
                    )}
                  </S.HiddenBorderWrapper>
              </S.InputContainer>
              
              <S.CheckboxContainer>
                {/* 전체 동의 */}
                <S.CheckboxWrapper onClick={agreementAll}>
                  <S.Checkbox src={isAllAgreed ? '/assets/images/join/checked-on.png' : '/assets/images/join/checked-off.png'} />
                  {/* <S.Checkbox checked={isAllAgreed} /> */}
                  <S.Terms checked={isAllAgreed}>필수 및 선택 항목을 모두 포함하여 동의합니다.</S.Terms>
                </S.CheckboxWrapper>
                
                {/* 개별 동의 */}
                {agreementList.map((terms, i) => (
                  <S.CheckboxWrapper key={i} className="detail" onClick={() => agreementOne(i)}>
                  <S.Checkbox src={agreement[i] ? '/assets/images/join/checked-on.png' : '/assets/images/join/checked-off.png'} />
                    {/* <S.Checkbox checked={agreement[i]} /> */}
                    <S.Terms checked={agreement[i]}>{terms}</S.Terms>
                  </S.CheckboxWrapper>
                ))}
              </S.CheckboxContainer>

              <S.JoinButton $active={isJoin}>
                <S.H4 disabled={isSubmitting}>회원가입</S.H4>
              </S.JoinButton>
          </S.Wrapper>
        </S.Container>
      </form>

    {showAlert && (
      <InfoAlert
        src="/assets/images/icon/check.png"
        message={alertMessage}
        handleOk={() => setShowAlert(false)}
      />
    )}
      {isModalOpen && <JoinCompleteModal onClose={() => {setIsModalOpen(false)}} />}
    </div>
  );
};

export default NormalJoin;