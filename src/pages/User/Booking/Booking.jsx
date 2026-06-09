import React, { useState, useEffect, useMemo } from "react";
import BookingStepper from "../../../components/Booking/BookingStepper";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import axiosClient from "../../../api/axiosClient";
import Step1BookingSelection from "./Step1SeatSelection";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Step2CustomerInfo from "./Step2CustomerInfo";
import { useAuth } from "../../../hooks/useAuth";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import Modal from "../../../components/common/Modal";
import Step3Payment from "./Step3Payment";
import { useEventSession } from "../../../hooks/useEventSession";
import { toast, ToastContainer } from "react-toastify";

const customerInfoSchema = z.object({
  fullName: z.string().min(2, "Họ tên quá ngắn"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại không đúng"),
});

function Booking() {
  const { user } = useAuth();
  const { eventId, showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [activeTicketType, setActiveTicketType] = useState(null);
  const [cart, setCart] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [soldOutSectionIds, setSoldOutSectionIds] = useState([]);
  const [notiModal, setNotiModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const [reservation, setReservation] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const { getSession, syncSession } = useEventSession();
  const closeNotiModal = () =>
    setNotiModal((prev) => ({ ...prev, isOpen: false }));

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await syncSession(showId);
        if (isMounted) {
          console.log("Đã nạp xong token cho show:", showId);
        }
      } catch (error) {
        if (isMounted) console.log("Lỗi:", error.message);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [showId, syncSession]);

  const ticketTypeMap = useMemo(() => {
    const map = new Map();
    if (show?.ticketTypes) {
      show.ticketTypes.forEach((type) => {
        map.set(type.sectionId, type);
      });
    }
    return map;
  }, [show]);

  const seatMap = useMemo(() => {
    const map = new Map();
    const soldOutSectionIdsLs = [];
    if (show?.ticketTypes) {
      show.ticketTypes.forEach((type) => {
        if (type?.status !== "ON_SALE") {
          if (type?.sectionId) {
            soldOutSectionIdsLs.push(type?.sectionId);
          }
        }
        type?.seats.forEach((seat) => {
          map.set(seat?.seatCode, seat);
        });
      });
    }

    const bookedSeatsCode = [];
    map.forEach((value) => {
      if (value.status !== "AVAILABLE") {
        bookedSeatsCode.push(value?.seatCode);
      }
    });

    // In log chi tiết để hỗ trợ debug trạng thái loại vé & phân khu bị khóa
    console.log("--- DEBUG ĐẶT VÉ ---");
    console.log("Danh sách loại vé (ticketTypes) & trạng thái:", show?.ticketTypes?.map(t => ({ id: t.id, name: t.name, status: t.status, sectionId: t.sectionId })));
    console.log("Danh sách ID phân khu bị coi là Hết vé / Khóa (soldOutSectionIds):", soldOutSectionIdsLs);
    console.log("--------------------");

    setBookedSeats(bookedSeatsCode);
    setSoldOutSectionIds(soldOutSectionIdsLs);
    return map;
  }, [show]);

  const onExpire = () => {
    const key = `booking_expiry_${showId}`;
    localStorage.removeItem(key);
    toast.error("Phiên đặt vé của bạn đã hết hạn. Hệ thống đang chuyển hướng bạn về trang chi tiết sự kiện.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
    setTimeout(() => {
      navigate(`/event/${eventId}/details`);
    }, 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axiosClient.get(`/shows/${showId}/booking`);
        const showRes = result?.data;
        setShow(showRes);
      } catch (error) {
        if (error.status === 404) {
          window.location.href = "/notfound";
          return;
        }
        console.log("Lấy dữ liệu show thất bại:", error.message);
      }
    };
    fetchData();
  }, [showId]);

  useEffect(() => {
    if (activeTicketType?.id) {
      const fetchSeats = async () => {
        try {
          console.log("Đang nạp danh sách ghế cho loại vé:", activeTicketType.name, "ID:", activeTicketType.id);
          const result = await axiosClient.get(`/shows/${showId}/ticket-types/${activeTicketType.id}/seats`);
          const seats = result?.data;
          console.log("Đã nạp xong số lượng ghế:", seats?.length);
          setShow((prevShow) => {
            if (!prevShow) return prevShow;
            const updatedTypes = prevShow.ticketTypes.map((type) => {
              if (type.id === activeTicketType.id) {
                const updatedType = { ...type, seats: seats };
                setActiveTicketType(updatedType);
                return updatedType;
              }
              return type;
            });
            return { ...prevShow, ticketTypes: updatedTypes };
          });
        } catch (error) {
          console.log("Lấy danh sách ghế thất bại:", error.message);
        }
      };
      fetchSeats();
    }
  }, [activeTicketType?.id, showId]);

  const handleSectionSelect = (sectionId, ticketTypeId) => {
    if (sectionId === null && ticketTypeId === null) {
      setActiveTicketType(null);
      return;
    }
    if (sectionId !== null && soldOutSectionIds.includes(sectionId)) return;
    if (ticketTypeId) {
      const typeObj = show?.ticketTypes?.find((t) => t.id === ticketTypeId);
      if (typeObj) {
        if (typeObj?.status !== "ON_SALE") return;
        setActiveTicketType(typeObj);
        return;
      }
    }
    const typeObj = ticketTypeMap.get(sectionId);
    if (typeObj && typeObj?.status !== "ON_SALE") return;
    setActiveTicketType(typeObj);
  };

  const handleSeatClick = (seatCode) => {
    const activeSeat = seatMap.get(seatCode);
    const isSelected = selectedSeats.includes(seatCode);
    setSelectedSeats((prev) =>
      isSelected ? prev.filter((id) => id !== seatCode) : [...prev, seatCode],
    );
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.ticketTypeId === activeTicketType?.id,
      );
      if (existingItemIndex !== -1) {
        const updatedCart = prevCart.map((item, index) => {
          if (index === existingItemIndex) {
            const updatedSeats = isSelected
              ? item.selectedSeats.filter((s) => s.seatCode !== seatCode)
              : [
                ...item.selectedSeats,
                {
                  ...activeSeat,
                  displayName:
                    activeSeat.rowName + "-" + activeSeat.seatNumber,
                },
              ];
            return {
              ...item,
              selectedSeats: updatedSeats,
              quantity: updatedSeats?.length,
            };
          }
          return item;
        });
        return updatedCart.filter((item) => item?.quantity > 0);
      }
      if (!isSelected) {
        const newItem = {
          ticketTypeId: activeTicketType.id,
          ticketTypeName: activeTicketType.name,
          tierId: activeTicketType?.tierId,
          tierName: activeTicketType.tierName,
          unitPrice: activeTicketType.tierPrice,
          quantity: 1,
          selectedSeats: [
            {
              ...activeSeat,
              displayName: activeSeat.rowName + "-" + activeSeat.seatNumber,
            },
          ],
        };
        return [...prevCart, newItem];
      }
      return prevCart;
    });
  };

  const handleRemoveSeat = (ticketTypeId, seatCode) => {
    setSelectedSeats((prev) => prev.filter((id) => id !== seatCode));
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.ticketTypeId === ticketTypeId,
      );
      if (existingItemIndex !== -1) {
        const updatedCart = prevCart.map((item, index) => {
          if (index === existingItemIndex) {
            const updatedSeats = item.selectedSeats.filter(
              (s) => s?.seatCode !== seatCode,
            );
            return {
              ...item,
              selectedSeats: updatedSeats,
              quantity: updatedSeats?.length,
            };
          }
          return item;
        });
        return updatedCart.filter((item) => item?.quantity > 0);
      }
      return prevCart;
    });
  };

  const handleUpdateCart = (ticketType, quantity, selectedSeats = []) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.ticketTypeId === ticketType.id,
      );
      if (quantity <= 0 && selectedSeats?.length === 0) {
        return prevCart.filter((item) => item.ticketTypeId !== ticketType.id);
      }
      const cartItem = {
        ticketTypeId: ticketType.id,
        ticketTypeName: ticketType.name,
        tierId: ticketType?.tierId,
        tierName: ticketType.tierName,
        seatingType: ticketType.seatingType,
        unitPrice: ticketType.tierPrice,
        quantity: quantity,
      };
      if (existingIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingIndex] = cartItem;
        return newCart;
      } else {
        return [...prevCart, cartItem];
      }
    });
  };

  const removeTicketTypeFromCart = (cartItem) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter(
        (item) => item.ticketTypeId != cartItem.ticketTypeId,
      );
      return newCart;
    });
  };

  const handleBackToOverview = () => {
    setActiveTicketType(null);
  };

  const methods = useForm({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    if (user) {
      methods.reset({
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, methods]);

  const handlePaymentConfirm = (data) => {
    setConfirmModal({
      isOpen: true,
      title: "Xác nhận thanh toán",
      message: "Bạn có chắc muốn tiếp tục thanh toán cho đơn đặt vé này không?",
      onConfirm: async () => {
        if (isSubmittingPayment) return;
        setIsSubmittingPayment(true);
        await handleConfirmPayment(data);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleConfirmPayment = async (data) => {
    const orderItems = cart.map((item) => {
      const seatIds = item.selectedSeats
        ? item.selectedSeats.map((s) => s.id)
        : [];
      return {
        ticketTypeId: item.ticketTypeId,
        ticketTierId: item.tierId,
        ticketTypeName: item.ticketTypeName,
        ticketTierName: item.tierName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.unitPrice * item.quantity,
        seatIds: seatIds,
        seatCodes: item.selectedSeats
          ? item.selectedSeats.map((s) => s.seatCode)
          : [],
      };
    });

    const finalPayload = {
      customerName: data.fullName,
      customerEmail: data.email,
      customerPhone: data.phone,
      showId: showId,
      items: orderItems,
      totalAmount: orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
    };
    console.log("Payload gửi về Backend:", finalPayload);
    console.log("JSON gửi về Backend:", JSON.stringify(finalPayload, null, 2));
    try {
      const queueToken = getSession(showId)?.token;
      const reservationRes = await axiosClient.post(
        `/reservations`,
        finalPayload,
        {
          headers: {
            "X-Queue-Token": queueToken,
          },
        }
      );
      setReservation(reservationRes?.data);
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      setNotiModal({
        isOpen: true,
        title: "Xác nhận thanh toán",
        message: "Đơn đặt hàng thất bại: " + error.message,
        type: "error",
      });
      console.log(error.message);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const onNext = () => {
    if (currentStep === 1 && cart?.length === 0) {
      alert("Vui lòng chọn ít nhất một loại vé để tiếp tục!");
      return;
    }
    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onBack = () => {
    if (currentStep === 2) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (currentStep === 3) {
      setConfirmModal({
        isOpen: true,
        title: "Xác nhận hủy đơn đặt hàng hiện tại",
        message: "Bạn có chắc muốn xóa đơn đặt hàng hiện tại hay không?",
        onConfirm: async () => {
          if (isSubmittingPayment) return;
          if (reservation === null) return;
          await handleCancelReservation(reservation?.id);
          setCurrentStep((prev) => prev - 1);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        },
      });
    }
  };

  const handleCancelReservation = async (id) => {
    try {
      await axiosClient.patch(`/reservations/${id}/cancel`);
    } catch (error) {
      console.log(error.message);
      setNotiModal({
        isOpen: true,
        title: "Hủy đơn đặt hàng",
        message: "Hủy đơn đặt hàng thất bại: " + error.message,
        type: "error",
      });
    }
  };

  const userIdRef = React.useRef(user?.id);
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/api/v1/ws");
    const stompClient = Stomp.over(socket);

    stompClient.debug = null;

    stompClient.connect(
      {},
      () => {
        console.log("Connected to WebSocket");
        stompClient.subscribe(`/topic/show/${showId}/seats`, (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            console.log("Nhận update ghế từ socket:", data);
            const { action, userId, seatCodes } = data;
            if (
              action === "HOLD" &&
              String(userIdRef.current) !== String(userId)
            ) {
              setBookedSeats((prev) => [...new Set([...prev, ...seatCodes])]);
              setSelectedSeats((prevSelected) => {
                const remainingSeats = prevSelected.filter(
                  (code) => !seatCodes.includes(code),
                );
                return remainingSeats;
              });

              setCart((prevCart) => {
                return prevCart
                  .map((item) => {
                    if (item.selectedSeats) {
                      const newSelectedSeats = item.selectedSeats.filter(
                        (s) => !seatCodes.includes(s?.seatCode),
                      );
                      return {
                        ...item,
                        selectedSeats: newSelectedSeats,
                        quantity: newSelectedSeats?.length,
                      };
                    }
                    return item;
                  })
                  .filter((item) => item.quantity > 0);
              });
            }
            if (action === "UNLOCK") {
              setBookedSeats((prev) =>
                prev.filter((code) => !seatCodes.includes(code)),
              );
            }
          }
        });
      },
      (error) => {
        console.error("WebSocket error:", error);
      },
    );

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [showId]);

  return (
    <>
      <ToastContainer />
      <ConfirmModal
        isOpen={confirmModal?.isOpen}
        title={confirmModal?.title}
        message={confirmModal?.message}
        onConfirm={confirmModal?.onConfirm}
        onClose={() => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
      ></ConfirmModal>
      {notiModal.isOpen && (
        <Modal
          isOpen={notiModal.isOpen}
          title={notiModal.title}
          message={notiModal.message}
          onClose={closeNotiModal}
          type={notiModal.type}
        />
      )}
      <div className="bg-slate-50">
        <BookingStepper
          currentStep={currentStep}
          onExpire={onExpire}
          expiryTime={getSession(showId)?.expiresAt || 0}
          onBack={onBack}
        ></BookingStepper>
        {currentStep === 1 && (
          <Step1BookingSelection
            activeTicketType={activeTicketType}
            bookedSeats={bookedSeats}
            cart={cart}
            handleBackToOverview={handleBackToOverview}
            handleRemoveSeat={handleRemoveSeat}
            handleSeatClick={handleSeatClick}
            handleSectionSelect={handleSectionSelect}
            handleUpdateCart={handleUpdateCart}
            removeTicketTypeFromCart={removeTicketTypeFromCart}
            selectedSeats={selectedSeats}
            show={show}
            onNext={onNext}
            soldOutSectionIds={soldOutSectionIds}
          ></Step1BookingSelection>
        )}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handlePaymentConfirm)}>
            {currentStep === 2 && (
              <Step2CustomerInfo
                cart={cart}
                onBack={onBack}
                isSubmittingPayment={isSubmittingPayment}
              ></Step2CustomerInfo>
            )}
          </form>
        </FormProvider>
        {currentStep === 3 && (
          <Step3Payment
            reservationInfo={reservation}
            onBack={onBack}
            showId={showId}
          ></Step3Payment>
        )}
      </div>
    </>
  );
}
export default Booking;
