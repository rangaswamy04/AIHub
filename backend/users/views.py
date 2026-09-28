from django.contrib.auth import authenticate

from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from rest_framework.authtoken.models import Token

from .serializers import RegisterSerializer, LoginSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    'message': 'User registered successfully.',
                    'username': user.username,
                    'email': user.email
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = authenticate(
                username=username,
                password=password
            )

            if user is not None:
                token, created = Token.objects.get_or_create(user=user)

                return Response(
                    {
                        'message': 'Login successful.',
                        'token': token.key,
                        'username': user.username,
                        'email': user.email
                    },
                    status=status.HTTP_200_OK
                )

            return Response(
                {
                    'message': 'Invalid username or password.'
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    
class ProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response(
            {
                'username': user.username,
                'email': user.email
            }
        )

class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()

        return Response(
            {
                'message': 'Logout successful.'
            },
            status=status.HTTP_200_OK
        )