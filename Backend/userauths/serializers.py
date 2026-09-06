from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import Profile, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields="__all__"

class ProfileSerializer(serializers.ModelSerializer):
    user=UserSerializer()
    class Meta:
        model=Profile
        fields="__all__"

    #to_representation() is used to control and manipulate the output data of a serializer before it is returned to the client, converting a Python/model object into a JSON-compatible representation.
    # def to_representation(self, instance):
    #     data=super().to_representation(instance)
    #     data["full_name"]= data["email"].upper()
    #     return data

class MyTokenObtainPariSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token=super().get_token(user)
        token["full_name"]=user.full_name
        token["email"]=user.email
        token["username"]=user.username
        try:
            token['vendor_id']=user.verdor.id
        except:
            token['vendor_id']=0
        return token
    
class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )

    password2 = serializers.CharField(
        write_only=True,
        required=True
    )

    class Meta:
        model = User
        fields = ["full_name", "email", "phone", "password", "password2"]

    def validate(self, attrs):

        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                "Confirm Password and Password must be same"
            )

        return attrs

    def create(self, validated_data):

        user = User.objects.create(
            full_name=validated_data["full_name"],
            email=validated_data["email"],
            phone=validated_data["phone"]
        )

        user.set_password(validated_data["password"])
        user.save()

        return user
    
